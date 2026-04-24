from django.contrib import admin

from .models import Event, EventCategory, EventImage


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"title",
		"movie_title",
		"starts_at",
		"location",
		"status",
		"created_by",
	)
	list_filter = ("status", "starts_at")
	search_fields = ("title", "movie_title", "location", "description")


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "slug", "parent")
	search_fields = ("name", "slug")
	prepopulated_fields = {"slug": ("name",)}


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
	list_display = ("id", "event", "position", "alt_text", "created_at")
	list_filter = ("event",)

# Register your models here.
