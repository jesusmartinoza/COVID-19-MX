from django.contrib import admin
from .models import State
from .models import ConfirmedCase

admin.site.register(State)
admin.site.register(ConfirmedCase)