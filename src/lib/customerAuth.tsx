"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Customer } from "@/types/admin";
import { supabase } from "@/lib/supabase";

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  loginCustomer: (customerData: Customer) => void;
  logoutCustomer: () => void;
  syncCustomerWithSupabase: (
    phone: string,
    name?: string,
    email?: string
  ) => Promise<Customer>;
  updateCustomerProfile: (data: Partial<Customer>) => Promise<boolean>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "zuriq_customer_session";

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Customer = JSON.parse(stored);
        if (parsed && (parsed.phone || parsed.id)) {
          setCustomer(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore customer session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginCustomer = (customerData: Customer) => {
    setCustomer(customerData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customerData));
    } catch (e) {
      console.error("Failed to persist customer session", e);
    }
  };

  const logoutCustomer = () => {
    setCustomer(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear customer session", e);
    }
  };

  /**
   * Synchronizes authenticated phone number with Supabase `customers` table.
   * If customer exists by phone, returns existing record.
   * If not, automatically creates a new customer profile.
   */
  const syncCustomerWithSupabase = async (
    phone: string,
    name?: string,
    email?: string
  ): Promise<Customer> => {
    const rawDigits = phone.replace(/\D/g, "");
    const last10 = rawDigits.slice(-10) || rawDigits;

    try {
      // 1. Search existing customer in Supabase by last 10 digits
      let existing: Customer | null = null;
      if (last10.length >= 6) {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .ilike("phone", `%${last10}%`)
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          existing = data as Customer;
        }
      }

      if (existing) {
        loginCustomer(existing);
        return existing;
      }

      // 2. Create new customer record in Supabase
      const defaultEmail =
        email || `client_${last10 || Date.now()}@zuriqfashion.com`;
      const defaultName = name || "ZURIQ Client";

      const newPayload = {
        name: defaultName,
        email: defaultEmail.toLowerCase(),
        phone: phone,
        address: null,
        total_orders: 0,
        total_spent: 0,
      };

      const { data: created, error: insertErr } = await supabase
        .from("customers")
        .insert(newPayload)
        .select()
        .single();

      if (insertErr || !created) {
        console.warn("Notice: Inserting customer into Supabase:", insertErr?.message);
        // Fallback local customer session
        const fallbackCustomer: Customer = {
          id: `cust_${Date.now()}`,
          name: defaultName,
          email: defaultEmail,
          phone: phone,
          address: null,
          total_orders: 0,
          total_spent: 0,
          created_at: new Date().toISOString(),
        };
        loginCustomer(fallbackCustomer);
        return fallbackCustomer;
      }

      const createdCustomer = created as Customer;
      loginCustomer(createdCustomer);
      return createdCustomer;
    } catch (err) {
      console.error("Error in syncCustomerWithSupabase:", err);
      const fallbackCustomer: Customer = {
        id: `cust_${Date.now()}`,
        name: name || "ZURIQ Client",
        email: email || `client_${last10}@zuriqfashion.com`,
        phone: phone,
        address: null,
        total_orders: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
      };
      loginCustomer(fallbackCustomer);
      return fallbackCustomer;
    }
  };

  /**
   * Updates customer profile details in Supabase and syncs local session
   */
  const updateCustomerProfile = async (data: Partial<Customer>): Promise<boolean> => {
    if (!customer) return false;

    try {
      const updatedCustomer = { ...customer, ...data };
      setCustomer(updatedCustomer);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCustomer));

      if (customer.id && !customer.id.startsWith("cust_")) {
        await supabase
          .from("customers")
          .update({
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
          })
          .eq("id", customer.id);
      }
      return true;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return false;
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        loginCustomer,
        logoutCustomer,
        syncCustomerWithSupabase,
        updateCustomerProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return context;
}
