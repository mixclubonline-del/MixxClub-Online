
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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface CreateContractDialogProps {
    onCreate: (contract: any) => void;
}

export function CreateContractDialog({ onCreate }: CreateContractDialogProps) {
    const { createContract, loading } = useEnterprise();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Service Agreement');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        const contractData = {
            title,
            type,
            value,
            description
        };

        const success = await createContract(contractData);
        
        if (success) {
            const newContract = {
                id: Math.random(),
                title,
                status: 'Draft',
                date: new Date().toISOString().split('T')[0],
                value: value || 'TBD',
                type
            };
            onCreate(newContract);
            setOpen(false);
            setTitle('');
            setValue('');
            setDescription('');
            setType('Service Agreement');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed gap-2 text-slate-500 hover:text-slate-900">
                    <Plus className="w-4 h-4" />
                    Create New Contract
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Create New Contract</DialogTitle>
                    <DialogDescription>
                        Draft a new smart contract or agreement.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. Artist Agreement 2024"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Service Agreement">Service Agreement</SelectItem>
                                <SelectItem value="Distribution Deal">Distribution Deal</SelectItem>
                                <SelectItem value="Copyright Split">Copyright Split</SelectItem>
                                <SelectItem value="NDA">NDA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value
                        </Label>
                        <Input
                            id="value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="col-span-3"
                            placeholder="$0.00 or % split"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            Notes
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                            placeholder="Additional details..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleCreate} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Draft'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
