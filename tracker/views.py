from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.db.models import Count
from .models import ConfirmedCase
from .models import SuspectedCase
from django.views.decorators.csrf import csrf_protect
import json

def index(request):
    context = {
        'total_confirmed': ConfirmedCase.objects.filter(healed=False).count(),
        'total_healed': ConfirmedCase.objects.filter(healed=True).count(),
        'total_suspected': SuspectedCase.objects.all().count()
    }

    return render(request, 'tracker/index.html', context)

@csrf_protect
def api(request):
    # INNER JOIN:
    # 'SELECT name FROM tracker_ConfirmedCase'\
    # 'INNER JOIN tracker_State'\
    # 'ON tracker_State.id = tracker_ConfirmedCase.state_id'
    cases = []

    for c in ConfirmedCase.objects.select_related('state_id'):
        cases.append({
            'sex': c.sex,
            'age': c.age,
            'healed': c.healed,
            'state_id': c.state_id.id,
            'state_name': c.state_id.name,
            'state_latitude': c.state_id.latitude,
            'state_longitude': c.state_id.longitude,
            'status': 'healed' if c.healed else 'confirmed'
        })

    for c in SuspectedCase.objects.select_related('state_id'):
        cases.append({
            'sex': c.sex,
            'age': c.age,
            'state_id': c.state_id.id,
            'state_name': c.state_id.name,
            'state_latitude': c.state_id.latitude,
            'state_longitude': c.state_id.longitude,
            'status': 'suspected'
        })

    context = {
        'total_confirmed': ConfirmedCase.objects.filter(healed=False).count(),
        'total_healed': ConfirmedCase.objects.filter(healed=True).count(),
        'total_suspected': SuspectedCase.objects.all().count(),
        'cases': sorted(cases, key=lambda c:c['state_name']),
    }

    return JsonResponse(context, safe=False)