from datetime import datetime
from django.db import models
from groups.models import Group


class Schedule(models.Model):
    DAYS = (
        ('Mon','Monday'),
        ('Tue','Tuesday'),
        ('Wed','Wednesday'),
        ('Thu','Thursday'),
        ('Fri','Friday'),
        ('Sat','Saturday'),
    )

    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    date = models.DateField()
    day = models.CharField(max_length=10, choices=DAYS, editable=False)
    start_time = models.TimeField()
    end_time = models.TimeField()
    subject = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        self.day = self.date.strftime('%a')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.group} {self.date}"
