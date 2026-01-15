from django.db import models

from django.db import models
from accounts.models import User
from groups.models import Group

class Rating(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role':'STUDENT'})
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    score = models.IntegerField()
    attendance = models.BooleanField(default=True)

