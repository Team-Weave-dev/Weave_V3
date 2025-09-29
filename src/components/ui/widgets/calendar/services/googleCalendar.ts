import type { CalendarEvent } from '@/types/dashboard';
import type { GoogleCalendarEvent, GoogleCalendarConfig } from '../types';

/**
 * Google Calendar Service
 * 구글 캘린더 API와 통합을 위한 서비스
 */
export class GoogleCalendarService {
  private gapi: any;
  private isInitialized = false;
  private config: GoogleCalendarConfig = {
    apiKey: '',
    clientId: '',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  };

  /**
   * Google Calendar API 초기화
   */
  async initialize(apiKey: string, clientId?: string): Promise<boolean> {
    try {
      // Google API 스크립트가 로드되었는지 확인
      if (typeof window === 'undefined' || !(window as any).gapi) {
        await this.loadGoogleApiScript();
      }

      this.gapi = (window as any).gapi;
      
      return new Promise((resolve, reject) => {
        this.gapi.load('client:auth2', async () => {
          try {
            await this.gapi.client.init({
              apiKey: apiKey,
              clientId: clientId || this.config.clientId,
              discoveryDocs: this.config.discoveryDocs,
              scope: this.config.scope,
            });
            
            this.isInitialized = true;
            resolve(true);
          } catch (error) {
            console.error('Google API initialization failed:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      return false;
    }
  }

  /**
   * Google API 스크립트 동적 로드
   */
  private loadGoogleApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-api-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-api-script';
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.body.appendChild(script);
    });
  }

  /**
   * 구글 계정 로그인
   */
  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('Google Calendar not initialized');
      return false;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      return authInstance.isSignedIn.get();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  /**
   * 구글 계정 로그아웃
   */
  async signOut(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      return true;
    } catch (error) {
      console.error('Google sign-out failed:', error);
      return false;
    }
  }

  /**
   * 로그인 상태 확인
   */
  isSignedIn(): boolean {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      return authInstance && authInstance.isSignedIn.get();
    } catch {
      return false;
    }
  }

  /**
   * 구글 캘린더 이벤트 목록 가져오기
   */
  async fetchEvents(
    calendarId = 'primary',
    timeMin?: Date,
    timeMax?: Date
  ): Promise<CalendarEvent[]> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error('Not authenticated');
      return [];
    }

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin?.toISOString() || new Date().toISOString(),
        timeMax: timeMax?.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events: GoogleCalendarEvent[] = response.result.items || [];
      return events.map(this.convertToCalendarEvent);
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
      return [];
    }
  }

  /**
   * 구글 이벤트를 내부 이벤트 형식으로 변환
   */
  private convertToCalendarEvent(googleEvent: GoogleCalendarEvent): CalendarEvent {
    const startDate = googleEvent.start.dateTime 
      ? new Date(googleEvent.start.dateTime)
      : new Date(googleEvent.start.date!);
    
    const endDate = googleEvent.end.dateTime
      ? new Date(googleEvent.end.dateTime)
      : new Date(googleEvent.end.date!);

    const allDay = !googleEvent.start.dateTime;
    
    return {
      id: googleEvent.id,
      title: googleEvent.summary || '제목 없음',
      date: startDate,
      type: 'other', // 구글 캘린더 이벤트는 기본적으로 'other' 타입
      description: googleEvent.description,
      location: googleEvent.location,
      allDay: allDay,
      startTime: !allDay ? startDate.toTimeString().slice(0, 5) : undefined,
      endTime: !allDay ? endDate.toTimeString().slice(0, 5) : undefined,
      googleEventId: googleEvent.id, // 구글 이벤트 ID 보존
    };
  }

  /**
   * 내부 이벤트를 구글 이벤트 형식으로 변환
   */
  private convertToGoogleEvent(event: CalendarEvent): GoogleCalendarEvent {
    const googleEvent: GoogleCalendarEvent = {
      id: event.googleEventId || event.id,
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {},
      end: {},
    };

    if (event.allDay) {
      googleEvent.start.date = event.date.toISOString().split('T')[0];
      googleEvent.end.date = event.date.toISOString().split('T')[0];
    } else {
      const startDateTime = new Date(event.date);
      const endDateTime = new Date(event.date);
      
      if (event.startTime) {
        const [hours, minutes] = event.startTime.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes));
      }
      
      if (event.endTime) {
        const [hours, minutes] = event.endTime.split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes));
      }
      
      googleEvent.start.dateTime = startDateTime.toISOString();
      googleEvent.end.dateTime = endDateTime.toISOString();
    }

    return googleEvent;
  }

  /**
   * 구글 캘린더에 이벤트 추가
   */
  async createEvent(event: CalendarEvent, calendarId = 'primary'): Promise<boolean> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error('Not authenticated');
      return false;
    }

    try {
      const googleEvent = this.convertToGoogleEvent(event);
      await this.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: googleEvent,
      });
      return true;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return false;
    }
  }

  /**
   * 구글 캘린더 이벤트 수정
   */
  async updateEvent(event: CalendarEvent, calendarId = 'primary'): Promise<boolean> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error('Not authenticated');
      return false;
    }

    try {
      const googleEvent = this.convertToGoogleEvent(event);
      await this.gapi.client.calendar.events.update({
        calendarId: calendarId,
        eventId: googleEvent.id,
        resource: googleEvent,
      });
      return true;
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      return false;
    }
  }

  /**
   * 구글 캘린더 이벤트 삭제
   */
  async deleteEvent(eventId: string, calendarId = 'primary'): Promise<boolean> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error('Not authenticated');
      return false;
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });
      return true;
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      return false;
    }
  }

  /**
   * 양방향 동기화
   */
  async syncWithGoogleCalendar(
    localEvents: CalendarEvent[],
    calendarId = 'primary'
  ): Promise<{ added: number; updated: number; deleted: number }> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error('Not authenticated');
      return { added: 0, updated: 0, deleted: 0 };
    }

    const stats = { added: 0, updated: 0, deleted: 0 };

    try {
      // 구글 캘린더에서 이벤트 가져오기
      const googleEvents = await this.fetchEvents(calendarId);
      
      // TODO: 실제 동기화 로직 구현
      // - 로컬 이벤트와 구글 이벤트 비교
      // - 충돌 해결 전략 적용
      // - 양방향 업데이트 수행
      
      console.log('Sync would be performed here with', localEvents.length, 'local events and', googleEvents.length, 'Google events');
      
      return stats;
    } catch (error) {
      console.error('Sync failed:', error);
      return stats;
    }
  }
}

// 싱글톤 인스턴스
export const googleCalendarService = new GoogleCalendarService();