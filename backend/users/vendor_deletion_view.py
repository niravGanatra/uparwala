class VendorDeletionView(APIView):
    """
    Delete a vendor and their associated profile
    """
    permission_classes = [IsAdminUser]
    
    def delete(self, request, pk):
        try:
            vendor = User.objects.get(pk=pk, is_vendor=True)
            username = vendor.username
            
            # Delete the vendor user (will cascade to VendorProfile if exists)
            vendor.delete()
            
            return Response({
                'message': f'Vendor {username} deleted successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'error': 'Vendor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
