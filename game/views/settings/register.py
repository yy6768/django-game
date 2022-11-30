from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username","").strip()
    password = data.get("password","").strip()
    password_confirm = data.get("password_confirm","").strip()
    if not username or not password:
        return JsonResponse({
            'result':'用户名和密码不能为空'
        })
    if password != password_confirm :

        return JsonResponse({
            'result':'两个密码不一致'
        })

    if User.objects.filter(username = username).exists():
        return JsonResponse({
            'result':'用户名已存在'
        })

    user = User(username = username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user,photo = 'https://upload-bbs.miyoushe.com/upload/2021/04/06/179799700/c5adb06fe76faf3fd5eba3557dc475d5_759734054226546890.jpg?x-oss-process=image%2Fresize%2Cs_600%2Fquality%2Cq_80%2Fauto-orient%2C0%2Finterlace%2C1%2Fformat%2Cjpg')
    login(request,user)
    return JsonResponse({
        'result':'success'
    })
