import React from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface UserInfoProps {
  name: string;
  email: string;
  avatarSrc?: string;
  className?: string;
}

export function UserInfo({
  name,
  email,
  avatarSrc,
  className,
}: UserInfoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar name={name} src={avatarSrc} size="sm" />
      <div className="flex flex-col min-w-0">
        <Text variant="label" className="truncate font-semibold text-text">
          {name}
        </Text>
        <Text variant="caption" tone="muted" className="truncate">
          {email}
        </Text>
      </div>
    </div>
  );
}
