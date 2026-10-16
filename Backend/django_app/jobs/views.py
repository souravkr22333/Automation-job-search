import httpx
import logging
from datetime import timedelta
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.core.paginator import Paginator
from django.utils import timezone
from .models import JobListing, JobSearchHistory
from .serializers import (
    JobListingSerializer,
    JobDiscoverySerializer,
    JobApplySerializer,
    JobSearchHistorySerializer
)
from resumes.models import Resume
from applications.models import Application, CoverLetter

logger = logging.getLogger(__name__)

FASTAPI_BASE_URL = "automation-job-search-production-8547.up.railway.app"

SOURCE_MAP = {
    'apify_linkedin': 'official',
    'apify_indeed': 'fast',
    'apify_naukri': 'multi_platform',
    'google_jobs': 'multi_platform',
    'indeed_rss': 'fast',
    'apify_linkedin_fast': 'fast',
    'apify_official': 'official',
    'apify_multi': 'multi_platform',
}
