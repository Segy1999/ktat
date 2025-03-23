import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { useToast } from './use-toast';
import { FlashDesign } from '@/lib/types';

export const useSupabase = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: Error) => {
    console.error('Supabase error:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message,
    });
  }, [toast]);

  const createBooking = useCallback(async (booking: Tables['bookings']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();

      if (error) {
        console.error('Booking error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }, []);

  const uploadImage = useCallback(async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [handleError]);

  const getFeaturedWorks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [handleError]);

  const getPortfolioItems = useCallback(async (category?: string) => {
    try {
      let query = supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [handleError]);

  const getFlashDesigns = useCallback(async (): Promise<FlashDesign[] | null> => {
    try {
      const { data, error } = await supabase
        .from('flash_designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [handleError]);

  const getFlashDesignById = useCallback(async (id: number): Promise<FlashDesign | null> => {
    try {
      const { data, error } = await supabase
        .from('flash_designs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [handleError]);

  const createFlashDesignBooking = useCallback(async (bookingData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    flash_design_id: number;
    tattoo_size: string;
    tattoo_placement: string;
    preferred_date?: string | null;
    availability?: string[] | null;
    pronouns?: string | null;
    allergies?: string | null;
    instagram?: string | null;
    special_requests?: string | null;
  }) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          is_custom: false,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error);
      throw error;
    }
  }, [handleError]);

  return {
    createBooking,
    uploadImage,
    getFeaturedWorks,
    getPortfolioItems,
    getFlashDesigns,
    getFlashDesignById,
    createFlashDesignBooking,
  };
};
