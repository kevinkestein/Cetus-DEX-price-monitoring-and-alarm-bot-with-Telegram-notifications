import { DatabaseInitializer } from './init';
import { alarmService, settingsService } from './services';
import { AlarmType, AlarmCondition } from '../../generated/prisma';

export async function runDatabaseTests(): Promise<void> {
  console.log('🧪 Running database tests...');
  
  try {
    // Test 1: Database connection
    console.log('Test 1: Database connection');
    const connected = await DatabaseInitializer.testConnection();
    console.log(`✅ Database connected: ${connected}`);
    
    // Test 2: Settings operations
    console.log('\nTest 2: Settings operations');
    const settings = await settingsService.getSettings();
    console.log('✅ Settings retrieved:', settings);
    
    // Test 3: Create a test alarm
    console.log('\nTest 3: Create test alarm');
    const testAlarm = await alarmService.createAlarm({
      name: 'Test Alarm',
      pair: 'SUI/USDC',
      alarmType: AlarmType.PERCENTAGE,
      condition: AlarmCondition.ABOVE,
      value: 10.0,
      basePrice: 1.5
    });
    console.log('✅ Test alarm created:', testAlarm);
    
    // Test 4: Retrieve alarms
    console.log('\nTest 4: Retrieve alarms');
    const alarms = await alarmService.getAllAlarms();
    console.log(`✅ Retrieved ${alarms.length} alarms`);
    
    // Test 5: Update alarm
    console.log('\nTest 5: Update alarm');
    const updatedAlarm = await alarmService.updateAlarm(testAlarm.id, {
      name: 'Updated Test Alarm'
    });
    console.log('✅ Alarm updated:', updatedAlarm.name);
    
    // Test 6: Toggle alarm
    console.log('\nTest 6: Toggle alarm');
    const toggledAlarm = await alarmService.toggleAlarm(testAlarm.id);
    console.log(`✅ Alarm toggled to: ${toggledAlarm.isActive ? 'active' : 'inactive'}`);
    
    // Test 7: Delete test alarm
    console.log('\nTest 7: Delete test alarm');
    await alarmService.deleteAlarm(testAlarm.id);
    console.log('✅ Test alarm deleted');
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  }
}