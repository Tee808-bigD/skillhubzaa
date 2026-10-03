import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    """
    Validates that the password contains at least:
    - 1 uppercase letter ([A-Z])
    - 1 numeric digit ([0-9])
    - 1 special punctuation character ([!@#$%^&*()_+=\-{}[\]:;"'<>,.?/\\|`~])
    """
    def __init__(self, min_length=8):
        self.min_length = min_length

    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("This password must contain at least one uppercase letter (A-Z)."),
                code='password_no_upper',
            )
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("This password must contain at least one digit (0-9)."),
                code='password_no_digit',
            )
        if not re.search(r'[!@#$%^&*()_+=\-{}[\]:;"\'<>,.?/\\|`~]', password):
            raise ValidationError(
                _("This password must contain at least one special character (!@#$%^&* etc.)."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least one uppercase letter, one digit, and one special character."
        )
