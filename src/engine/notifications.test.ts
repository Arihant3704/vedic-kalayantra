import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateDailyAlerts, 
  findDueAlerts, 
  DEFAULT_NOTIFICATION_PREFERENCES 
} from './notifications';
import { DEFAULT_CITY } from './kosha';

test('notifications: generateDailyAlerts produces location-aware daily schedule', () => {
  const testDate = new Date(2026, 9, 27, 10, 0, 0); // Oct 27, 2026
  const alerts = generateDailyAlerts(testDate, DEFAULT_CITY, 'lahiri', DEFAULT_NOTIFICATION_PREFERENCES);

  assert.ok(alerts.length > 0, 'Should generate scheduled alerts for the day');

  // Verify essential Muhurtas are present
  const titles = alerts.map(a => a.title);
  assert.ok(titles.some(t => t.includes('Brahma Muhurta')), 'Should include Brahma Muhurta');
  assert.ok(titles.some(t => t.includes('Abhijit Muhurta')), 'Should include Abhijit Muhurta');
  assert.ok(titles.some(t => t.includes('Rāhu Kāla')), 'Should include Rāhu Kāla');
  assert.ok(titles.some(t => t.includes('Yamagaṇḍa')), 'Should include Yamaganda');

  // Verify lead time math
  const leadMs = DEFAULT_NOTIFICATION_PREFERENCES.leadMinutes * 60000;
  for (const alert of alerts) {
    const diff = alert.targetTime.getTime() - alert.triggerTime.getTime();
    assert.equal(diff, leadMs, `Alert triggerTime must be exactly ${DEFAULT_NOTIFICATION_PREFERENCES.leadMinutes} min before targetTime`);
    assert.equal(alert.cityName, DEFAULT_CITY.name);
    assert.ok(alert.id.length > 0);
  }

  // Verify chronological order
  for (let i = 0; i < alerts.length - 1; i++) {
    assert.ok(
      alerts[i].triggerTime.getTime() <= alerts[i + 1].triggerTime.getTime(),
      `Alerts must be chronologically ordered by triggerTime`
    );
  }
});

test('notifications: preference filtering enables or disables specific alerts', () => {
  const testDate = new Date(2026, 9, 27, 10, 0, 0);

  // Disable Rahu Kaal and Choghadiyas
  const customPrefs = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    leadMinutes: 15 as const,
    muhurtas: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.muhurtas,
      rahuKaal: false,
      choghadiyaAmritShubh: false,
    },
  };

  const filteredAlerts = generateDailyAlerts(testDate, DEFAULT_CITY, 'lahiri', customPrefs);

  const titles = filteredAlerts.map(a => a.title);
  assert.ok(!titles.some(t => t.includes('Rāhu Kāla')), 'Rāhu Kāla should be excluded when disabled');
  assert.ok(!titles.some(t => t.includes('Choghadiya')), 'Choghadiya alerts should be excluded when disabled');
  assert.ok(titles.some(t => t.includes('Abhijit Muhurta')), 'Abhijit Muhurta should still be included');

  // Check 15 minute lead time
  for (const alert of filteredAlerts) {
    const diff = alert.targetTime.getTime() - alert.triggerTime.getTime();
    assert.equal(diff, 15 * 60000, 'Trigger time must reflect 15 min lead');
  }
});

test('notifications: findDueAlerts triggers when currentTime is within trigger window', () => {
  const baseTime = new Date(2026, 9, 27, 12, 0, 0);
  const targetTime = new Date(baseTime.getTime() + 10 * 60000); // in 10 minutes
  const triggerTime = new Date(targetTime.getTime() - 5 * 60000); // in 5 minutes

  const mockAlerts = [
    {
      id: 'test_alert_due',
      title: 'Due Muhurta',
      subtitle: 'Starting in 5 min',
      type: 'shubha' as const,
      targetTime,
      triggerTime,
      leadMinutes: 5,
      description: 'Test description',
      cityName: 'New Delhi',
    },
    {
      id: 'test_alert_future',
      title: 'Far Future Muhurta',
      subtitle: 'Starting later',
      type: 'shubha' as const,
      targetTime: new Date(baseTime.getTime() + 120 * 60000),
      triggerTime: new Date(baseTime.getTime() + 115 * 60000),
      leadMinutes: 5,
      description: 'Test future description',
      cityName: 'New Delhi',
    },
  ];

  const triggeredSet = new Set<string>();

  // At baseTime (before triggerTime), nothing should be due
  const dueBefore = findDueAlerts(mockAlerts, baseTime, triggeredSet);
  assert.equal(dueBefore.length, 0, 'No alert should be due before trigger time');

  // At baseTime + 6 minutes (after triggerTime), test_alert_due should be due
  const checkTime = new Date(baseTime.getTime() + 6 * 60000);
  const dueNow = findDueAlerts(mockAlerts, checkTime, triggeredSet);
  assert.equal(dueNow.length, 1, 'Exactly one alert should be due');
  assert.equal(dueNow[0].id, 'test_alert_due');

  // Once marked as triggered, it should not trigger again
  triggeredSet.add('test_alert_due');
  const dueAfterRecorded = findDueAlerts(mockAlerts, checkTime, triggeredSet);
  assert.equal(dueAfterRecorded.length, 0, 'Already triggered alert must not fire again');
});
