
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Organization {
    id: string;
    name: string;
    owner_id: string;
}

export interface Member {
    id: string;
    email: string;
    role: string;
    status: 'Active' | 'Pending';
    name?: string; // Optional, often joined from profile
}

export interface Contract {
    id: string;
    title: string;
    type: string;
    value: string;
    status: string;
    date: string;
    description?: string;
}

export const useEnterprise = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Helper to get the user's organization (assuming single org for now)
    const getOrganization = useCallback(async () => {
        if (!user) return null;
        
        // Check if owner
        const { data: ownedOrg } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_id', user.id)
            .single();
            
        if (ownedOrg) return ownedOrg;

        // Check if member
        const { data: memberOrg } = await supabase
            .from('organization_members')
            .select('organizations(*)')
            .eq('user_id', user.id)
            .single();

        return memberOrg?.organizations || null;
    }, [user]);

    const inviteMember = async (email: string, role: string, name: string) => {
        try {
            setLoading(true);
            const org = await getOrganization();
            
            if (!org) {
                // Auto-create organization if none exists for this owner (Demo flow)
                const { data: newOrg, error: createError } = await supabase
                    .from('organizations')
                    .insert({ name: `${name}'s Label`, owner_id: user?.id })
                    .select()
                    .single();
                
                if (createError) throw createError;
                
                // Continue with new org
                await insertMember(newOrg.id, email, role);
            } else {
                 await insertMember(org.id, email, role);
            }

            toast({
                title: "Invitation Sent",
                description: `Invited ${email} as ${role}.`,
            });
            return true;
        } catch (error: any) {
            console.error('Invite error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to invite member",
                variant: "destructive"
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const insertMember = async (orgId: string, email: string, role: string) => {
         const { error } = await supabase
            .from('organization_members')
            .insert({
                organization_id: orgId,
                email,
                role,
                status: 'Pending'
            });
        if (error) throw error;
    }

    const createContract = async (contractData: any) => {
        try {
            setLoading(true);
            const org = await getOrganization();
            
            if (!org) {
                throw new Error("You must create an organization first");
            }

            const { error } = await supabase
                .from('contracts')
                .insert({
                    organization_id: org.id,
                    title: contractData.title,
                    type: contractData.type,
                    value: contractData.value,
                    description: contractData.description,
                    status: 'Draft',
                    created_by: user?.id
                });

            if (error) throw error;

            toast({
                title: "Contract Drafted",
                description: `${contractData.title} created successfully.`,
            });
            return true;
        } catch (error: any) {
             console.error('Contract error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to create contract",
                variant: "destructive"
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        inviteMember,
        createContract,
        loading
    };
};
