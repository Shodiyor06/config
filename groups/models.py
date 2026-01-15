from django.db import models
from courses.models import Course
from accounts.models import User

class Group(models.Model):
    DAYS = (
        ('Mon','Monday'),
        ('Tue','Tuesday'),
        ('Wed','Wednesday'),
        ('Thu','Thursday'),
        ('Fri','Friday'),
        ('Sat','Saturday'),
    )

    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'TEACHER'}
    )
    students = models.ManyToManyField(
        User,
        related_name='student_groups',
        limit_choices_to={'role': 'STUDENT'}
    )

    days = models.JSONField(default=list)  # 🔥 ['Mon','Wed','Fri']

    def __str__(self):
        return self.name
