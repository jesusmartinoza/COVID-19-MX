from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Count
from .models import ConfirmedCase
from .models import SuspectedCase
import json

def index(request):
    q1 = ConfirmedCase.objects.all().values('state_id').annotate(total=Count('state_id')).order_by()

    print(q1)
    context = {
        'total_confirmed': ConfirmedCase.objects.filter(healed=False).count(),
        'total_healed': ConfirmedCase.objects.filter(healed=True).count(),
        'total_suspected': SuspectedCase.objects.all().count(),
        'states': json.dumps(list(q1)),
    }
    
    return render(request, 'tracker/index.html', context)