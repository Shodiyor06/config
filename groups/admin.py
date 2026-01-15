from django.contrib import admin
from django import forms
from .models import Group

class GroupAdminForm(forms.ModelForm):
    days = forms.MultipleChoiceField(
        choices=Group.DAYS,
        widget=forms.CheckboxSelectMultiple,
        required=True
    )

    class Meta:
        model = Group
        fields = '__all__'


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    form = GroupAdminForm
    list_display = ('name', 'course', 'teacher', 'get_days')

    def get_days(self, obj):
        return ", ".join(obj.days)
    get_days.short_description = "Dars kunlari"

