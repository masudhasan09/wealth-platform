'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/templates/PageLayout';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Alert } from '@/components/molecules/Alert';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { updateProfileNameAction, changePasswordAction } from '@/app/actions/settings';

export interface SettingsClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt?: Date | string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{
    tone: 'success' | 'danger';
    message: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    tone: 'success' | 'danger';
    message: string;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [costBasisMethod, setCostBasisMethod] = useState('fifo');
  const [refreshInterval, setRefreshInterval] = useState('15');

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameFeedback(null);
    setIsUpdatingName(true);
    try {
      const res = await updateProfileNameAction({ name });
      if (res.error) {
        setNameFeedback({ tone: 'danger', message: res.error });
      } else {
        setNameFeedback({ tone: 'success', message: 'Profile name updated successfully.' });
      }
    } catch {
      setNameFeedback({
        tone: 'danger',
        message: 'An unexpected error occurred while updating name.',
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ tone: 'danger', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({
        tone: 'danger',
        message: 'New password must be at least 8 characters.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.error) {
        setPasswordFeedback({ tone: 'danger', message: res.error });
      } else {
        setPasswordFeedback({
          tone: 'success',
          message: res.message || 'Password changed successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordFeedback({
        tone: 'danger',
        message: 'An unexpected error occurred while changing password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <PageLayout
      title="Platform Settings"
      description="Configure your portfolio preferences, tax accounting methodology, and account settings."
    >
      <div className="max-w-3xl space-y-8">
        {saveSuccess && (
          <Alert tone="success" title="Preferences Saved" onDismiss={() => setSaveSuccess(false)}>
            Your portfolio display and tax accounting preferences have been updated.
          </Alert>
        )}

        {/* Profile Card */}
        <div className="p-6 rounded-xl border border-border bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <Heading level="h3">User Profile</Heading>
              <Text variant="caption" tone="muted">
                Manage your profile details and authenticated account
              </Text>
            </div>
            <Badge tone="success">Active</Badge>
          </div>

          {nameFeedback && (
            <Alert tone={nameFeedback.tone} onDismiss={() => setNameFeedback(null)}>
              {nameFeedback.message}
            </Alert>
          )}

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </FormField>

              <FormField label="Email Address" hint="Email address cannot be changed">
                <Input value={user.email} disabled readOnly />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" type="submit" disabled={isUpdatingName || !name.trim()}>
                <Icon name="Save" size="sm" className="mr-1.5" />
                {isUpdatingName ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="p-6 rounded-xl border border-border bg-surface shadow-xs space-y-4">
          <div className="pb-4 border-b border-border">
            <Heading level="h3">Security &amp; Password</Heading>
            <Text variant="caption" tone="muted">
              Change your password to keep your account secure
            </Text>
          </div>

          {passwordFeedback && (
            <Alert tone={passwordFeedback.tone} onDismiss={() => setPasswordFeedback(null)}>
              {passwordFeedback.message}
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <FormField label="Current Password" required>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="New Password" hint="Must be at least 8 characters" required>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                />
              </FormField>

              <FormField label="Confirm New Password" required>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                <Icon name="Lock" size="sm" className="mr-1.5" />
                {isChangingPassword ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>

        {/* Financial & Tax Accounting Preferences */}
        <form onSubmit={handleSave} className="p-6 rounded-xl border border-border bg-surface shadow-xs space-y-6">
          <div className="pb-4 border-b border-border">
            <Heading level="h3">Financial &amp; Tax Preferences</Heading>
            <Text variant="caption" tone="muted">
              Configure accounting methods and pricing refresh frequency
            </Text>
          </div>

          <div className="space-y-4">
            <FormField
              label="Tax Lot Accounting Method"
              hint="US IRS Schedule D default reporting convention"
            >
              <Select
                value={costBasisMethod}
                onChange={(e) => setCostBasisMethod(e.target.value)}
              >
                <option value="fifo">FIFO (First-In, First-Out) — Active</option>
                <option value="lifo" disabled>LIFO (Last-In, First-Out) — Future Phase</option>
                <option value="hifo" disabled>HIFO (Highest-In, First-Out) — Future Phase</option>
              </Select>
            </FormField>

            <FormField
              label="Reporting Base Currency"
              hint="Currency used for portfolio valuation and net worth calculation"
            >
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD — United States Dollar ($)</option>
                <option value="EUR" disabled>EUR — Euro (€)</option>
                <option value="GBP" disabled>GBP — British Pound (£)</option>
              </Select>
            </FormField>

            <FormField
              label="Price Cache Expiration (Minutes)"
              hint="Controls how frequently market prices are refreshed from external APIs"
            >
              <Select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <option value="15">15 Minutes (Recommended)</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (Hourly)</option>
                <option value="1440">Daily (End of Day)</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit">
              <Icon name="Save" size="sm" className="mr-1.5" />
              Save Preferences
            </Button>
          </div>
        </form>

        {/* Data & Portfolio Actions */}
        <div className="p-6 rounded-xl border border-border bg-surface shadow-xs space-y-4">
          <div className="pb-4 border-b border-border">
            <Heading level="h3">Data Management</Heading>
            <Text variant="caption" tone="muted">
              Import, export, and audit your financial data
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/transactions/import" className="flex-1">
              <Button variant="secondary" className="w-full justify-center">
                <Icon name="Upload" size="sm" className="mr-1.5" />
                Import Transactions (CSV)
              </Button>
            </a>

            <a href="/reports" className="flex-1">
              <Button variant="secondary" className="w-full justify-center">
                <Icon name="FileText" size="sm" className="mr-1.5" />
                Export Valuation Reports
              </Button>
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4">
          <DisclaimerNotice variant="compact" />
        </div>
      </div>
    </PageLayout>
  );
}
