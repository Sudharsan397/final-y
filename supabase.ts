
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qicuyqipletjiigjuccr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3V5cWlwbGV0amlpZ2p1Y2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjU4MDgsImV4cCI6MjA4NjY0MTgwOH0.aBtmMXX9h-k5brv5GNPvH9lerIwCL24Ed6S-KmgV5IQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
