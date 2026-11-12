import { describe, it, expect, vi } from 'vitest';
const state=vi.hoisted(()=>({userId: 'ecosystem-user' as string | null}));
vi.mock('@/contexts/AuthContext',()=>({useAuth:()=>({user:state.userId?{id:state.userId}:null})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
vi.mock('@tanstack/react-query',()=>({useQuery:vi.fn(()=>({}))}));
import {useQuery} from '@tanstack/react-query';
import {useSupabaseSuppliers,useSupabaseSupplierById} from './useSupabaseSuppliers';
import {useSupabaseCategories} from './useSupabaseCategories';
import {useBolsasSuppliers} from './useBolsasSuppliers';
const hooks=[()=>useSupabaseSuppliers('exclusive'),()=>useSupabaseSupplierById(2),useSupabaseCategories,useBolsasSuppliers];
describe('supplier caches are isolated by authenticated identity',()=>{
 for(const [index,hook] of hooks.entries()) it(`supplier query ${index+1} cannot reuse another customer's cached result`,()=>{
  state.userId='ecosystem-user';hook();const before=vi.mocked(useQuery).mock.lastCall?.[0];
  state.userId='bolsas-user';hook();const after=vi.mocked(useQuery).mock.lastCall?.[0];
  expect(before?.queryKey).not.toEqual(after?.queryKey);
  expect(after?.queryKey).toContain('bolsas-user');
  state.userId=null;hook();expect(vi.mocked(useQuery).mock.lastCall?.[0].enabled).toBe(false);
 });
});
