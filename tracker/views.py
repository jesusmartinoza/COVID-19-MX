from django.shortcuts import render
from django.http import HttpResponse
from .models import ConfirmedCase

def index(request):
    context = {
        'total_confirmed': ConfirmedCase.objects.filter(healed=False).count(),
        'total_healed': ConfirmedCase.objects.filter(healed=True).count()
    }
    return render(request, 'tracker/index.html', context)