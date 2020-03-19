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
    confirmed_by_age = {}
    healed_by_age = {}
    suspected_by_age = {}

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

    age_step = 5
    for i in range(0, 90, age_step):
        confirmed_by_age[f'{i} - {i + age_step}'] = ConfirmedCase.objects.filter(
            healed=False, age__gte=i, age__lt=i+age_step).count()

        healed_by_age[f'{i} - {i + age_step}'] = ConfirmedCase.objects.filter(
            healed=True, age__gte=i, age__lt=i+age_step).count()

        suspected_by_age[f'{i} - {i + age_step}'] = SuspectedCase.objects.filter(
            age__gte=i, age__lt=i+age_step).count()

    context = {
        'total_confirmed': ConfirmedCase.objects.filter(healed=False).count(),
        'total_healed': ConfirmedCase.objects.filter(healed=True).count(),
        'total_suspected': SuspectedCase.objects.all().count(),
        'cases': sorted(cases, key=lambda c: c['state_name']),
        'confirmed_by_age': confirmed_by_age,
        'healed_by_age': healed_by_age,
        'suspected_by_age': suspected_by_age

    }

    return JsonResponse(context, safe=False)
