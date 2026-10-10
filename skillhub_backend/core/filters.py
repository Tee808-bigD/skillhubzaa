import django_filters
from django.db.models import Q
from .models import User, Post

class UserFilter(django_filters.FilterSet):
    """
    Advanced FilterSet for SkillHub Global Professionals & Creators.
    Supports filtering by skill category, geographic location (city or country),
    creator status, minimum rating threshold, and hourly rate budget ranges.
    """
    category = django_filters.CharFilter(method='filter_category', label='Skill or Trade Category')
    location = django_filters.CharFilter(method='filter_location', label='Location (City, Country, or Region)')
    is_creator = django_filters.BooleanFilter(field_name='is_creator', label='Only Content Creators & Professionals')
    verified = django_filters.BooleanFilter(field_name='verified', label='Verified Professionals Only')
    
    # Rating Filtering (gte = greater than or equal to)
    rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte', label='Minimum Rating')
    rating__gte = django_filters.NumberFilter(field_name='rating', lookup_expr='gte', label='Rating GTE')
    
    # Hourly Rate Range Filtering
    hourly_rate = django_filters.RangeFilter(field_name='hourly_rate', label='Hourly Rate Range')
    hourly_rate__gte = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='gte', label='Min Hourly Rate')
    hourly_rate__lte = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte', label='Max Hourly Rate')
    min_price = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='gte', label='Min Price Alias')
    max_price = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte', label='Max Price Alias')

    class Meta:
        model = User
        fields = [
            'category',
            'location',
            'is_creator',
            'verified',
            'rating',
            'rating__gte',
            'hourly_rate',
            'hourly_rate__gte',
            'hourly_rate__lte',
            'role',
            'province',
        ]

    def filter_category(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip().lower()
        # Handle aliases like 'web-dev' -> 'web', 'ui-ux' -> 'design'
        if val in ['web-dev', 'coding']:
            return queryset.filter(Q(skills__icontains='web') | Q(skills__icontains='react') | Q(skills__icontains='fullstack') | Q(skills__icontains='python') | Q(bio__icontains='developer'))
        if val in ['ui-ux', 'design']:
            return queryset.filter(Q(skills__icontains='design') | Q(skills__icontains='ui') | Q(skills__icontains='ux') | Q(skills__icontains='figma') | Q(bio__icontains='designer'))
        if val in ['solar', 'trades']:
            return queryset.filter(Q(skills__icontains='solar') | Q(skills__icontains='electrical') | Q(skills__icontains='pv') | Q(skills__icontains='artisan'))
        if val in ['ai-data', 'ai']:
            return queryset.filter(Q(skills__icontains='ai') | Q(skills__icontains='pytorch') | Q(skills__icontains='data') | Q(skills__icontains='machine learning'))
        if val in ['devops', 'cloud']:
            return queryset.filter(Q(skills__icontains='cloud') | Q(skills__icontains='devops') | Q(skills__icontains='docker') | Q(skills__icontains='aws'))
        
        # General matching
        return queryset.filter(
            Q(skills__icontains=val) |
            Q(bio__icontains=val)
        )

    def filter_location(self, queryset, name, value):
        if not value or value.lower() in ['all', 'anywhere']:
            return queryset
        val = value.strip()
        return queryset.filter(
            Q(location__icontains=val) |
            Q(country__icontains=val) |
            Q(province__icontains=val)
        )


class PostFilter(django_filters.FilterSet):
    """
    FilterSet for Community & Showcase Posts.
    """
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    author = django_filters.CharFilter(field_name='author__username', lookup_expr='iexact')
    post_type = django_filters.CharFilter(field_name='post_type', lookup_expr='iexact')
    hashtag = django_filters.CharFilter(method='filter_hashtag')

    class Meta:
        model = Post
        fields = ['category', 'author', 'post_type', 'media_type']

    def filter_hashtag(self, queryset, name, value):
        if not value:
            return queryset
        tag = value.strip().lstrip('#')
        return queryset.filter(hashtags__icontains=tag)
