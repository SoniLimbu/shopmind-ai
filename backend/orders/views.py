from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get or create the cart for the logged-in user."""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add a product to the cart or increase its quantity."""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product_id=product_id,
            defaults={'quantity': quantity}
        )

        if not created:
            # If it already exists, just add to the quantity
            cart_item.quantity += quantity
            cart_item.save()

        # Return updated cart
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['put'])
    def update_item(self, request):
        """Update the quantity of a specific cart item."""
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        if not item_id:
            return Response({"error": "Item ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            if quantity > 0:
                cart_item.quantity = quantity
                cart_item.save()
            else:
                cart_item.delete()  # Remove if quantity is 0
            
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove an item from the cart entirely."""
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def checkout(self, request):
        """Convert the user's cart into a formal Order."""
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = request.data.get('shipping_address')
        if not shipping_address:
            return Response({"error": "Shipping address is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Pre-check stock levels
        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response({
                    "error": f"Not enough stock for {item.product.name}. Only {item.product.stock} left."
                }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Create the Order
        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_address,
            total_amount=sum(item.total_price for item in cart_items),
            status='Confirmed'
        )

        # 3. Create Order Items and decrease stock
        for item in cart_items:
            # Snapshot the exact product name and price at time of purchase
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity
            )
            
            # Decrease actual product stock in the database
            item.product.stock -= item.quantity
            item.product.save()

        # 4. Empty the Cart
        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
