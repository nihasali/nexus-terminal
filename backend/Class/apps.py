from django.apps import AppConfig


class ClassConfig(AppConfig):
    name = 'Class'

    def ready(self):
        import Class.signals