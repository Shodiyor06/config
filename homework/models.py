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
        """Return deadline (24 hours after creation)"""
        return self.created_at + timedelta(hours=24)

    def is_expired(self):
        """Check if homework deadline has passed"""
        return timezone.now() > self.deadline()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class HomeworkSubmission(models.Model):
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'}
    )
    file = models.FileField(upload_to='homeworks/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # Grading fields
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    def is_late(self):
        """Check if submission was late"""
        return self.submitted_at > self.homework.deadline()

    def __str__(self):
        return f"{self.student.phone} - {self.homework.title}"

    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['homework', 'student']