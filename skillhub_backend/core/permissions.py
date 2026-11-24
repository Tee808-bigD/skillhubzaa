from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAuthorOrReadOnly(BasePermission):
    """Allow anyone to read, but only the owner (or staff) to change an object.

    Works for models that record their owner as ``author``, ``organizer`` or
    ``provider``.
    """

    message = 'Only the owner of this object can modify it.'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        owner = (
            getattr(obj, 'author', None)
            or getattr(obj, 'organizer', None)
            or getattr(obj, 'provider', None)
        )
        return owner == request.user
