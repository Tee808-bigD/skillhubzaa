import React from 'react';
import { CommunityEvent, YouthService, User } from '../types';
import { InteractiveMapView } from './InteractiveMapView';

interface EventMapViewProps {
  events: CommunityEvent[];
  services: YouthService[];
  currentUser?: User;
  onUpdateUser?: (updatedUser: User) => void;
  onSelectEvent?: (event: CommunityEvent) => void;
  onSelectService?: (service: YouthService) => void;
  onOpenProfile?: (username: string) => void;
}

export const EventMapView: React.FC<EventMapViewProps> = (props) => {
  return <InteractiveMapView {...props} />;
};

export default EventMapView;
