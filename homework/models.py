from django.db import models
from django.db import models
from django.utils import timezone
from datetime import timedelta
from groups.models import Group
from accounts.models import User

class Homework(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def deadline(self):
        return self.created_at + timedelta(hours=24)

    def is_expired(self):
        return timezone.now() > self.deadline()

    def __str__(self):
        return self.title


class HomeworkSubmission(models.Model):
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE)
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'}
    )
    file = models.FileField(upload_to='homeworks/')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def is_late(self):
        return self.submitted_at > self.homework.deadline()
