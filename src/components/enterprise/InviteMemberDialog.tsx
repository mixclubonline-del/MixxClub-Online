
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEnterprise } from '@/hooks/useEnterprise';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface InviteMemberDialogProps {
    onInvite: (member: any) => void;
}

export function InviteMemberDialog({ onInvite }: InviteMemberDialogProps) {
    const { inviteMember, loading } = useEnterprise();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Member');

    const handleInvite = async () => {
        const success = await inviteMember(email, role, name);
        if (success) {
            // Optimistic update for UI
            const newMember = {
                id: Math.random(),
                name,
                email,
                role,
                status: 'Pending'
            };
            onInvite(newMember);
            setOpen(false);
            setEmail('');
            setName('');
            setRole('Member');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to a new team member. They will receive an email to join your organization.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="A&R">A&R</SelectItem>
                                <SelectItem value="Member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleInvite} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
