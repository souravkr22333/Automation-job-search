from datetime import timedelta
from uuid import uuid4

from django.utils import timezone
from rest_framework.test import APITestCase

from applications.models import Application
from jobs.models import JobListing
from users.models import User


class DashboardStatsViewTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='dashboard@example.com',
			username='dashboard-user',
			name='Dashboard User',
			password='test-password-123',
		)
		self.other_user = User.objects.create_user(
			email='other@example.com',
			username='other-user',
			name='Other User',
			password='test-password-123',
		)
		self.url = '/api/users/dashboard-stats/'

	def create_job(self, user, discovered_at, is_saved=False):
		job = JobListing.objects.create(
			user=user,
			url=f'https://example.com/jobs/{uuid4()}',
			title='Software Engineer',
			company='Example Co',
			is_saved=is_saved,
		)
		JobListing.objects.filter(pk=job.pk).update(discovered_at=discovered_at)
		return job

	def create_application(self, user, job, applied_at, status):
		application = Application.objects.create(
			user=user,
			job=job,
			status=status,
		)
		Application.objects.filter(pk=application.pk).update(applied_at=applied_at)
		return application

	def test_requires_authentication(self):
		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 401)

	def test_returns_current_user_counts_for_week_and_month(self):
		now = timezone.now()
		local_now = timezone.localtime(now)
		week_start = local_now.replace(
			hour=0, minute=0, second=0, microsecond=0
		) - timedelta(days=local_now.weekday())
		month_start = local_now.replace(
			day=1, hour=0, minute=0, second=0, microsecond=0
		)
		previous_month = month_start - timedelta(seconds=1)

		current_job = self.create_job(self.user, now, is_saved=True)
		month_job = self.create_job(self.user, month_start, is_saved=True)
		foreign_job = self.create_job(self.other_user, now, is_saved=True)

		self.create_application(
			self.user, current_job, now, Application.Status.INTERVIEWING
		)
		self.create_application(
			self.user, month_job, month_start, Application.Status.APPLIED
		)
		self.create_application(
			self.other_user, foreign_job, now, Application.Status.INTERVIEWING
		)
		previous_job = self.create_job(self.user, previous_month)
		self.create_application(
			self.user, previous_job, previous_month, Application.Status.APPLIED
		)

		self.client.force_authenticate(user=self.user)
		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data, {
			'jobs': {
				'this_week': int(now >= week_start) + int(month_start >= week_start),
				'this_month': 2,
			},
			'applications': {
				'this_week': int(now >= week_start) + int(month_start >= week_start),
				'this_month': 2,
			},
			'shortlisted': 2,
			'interviewing': 1,
		})
