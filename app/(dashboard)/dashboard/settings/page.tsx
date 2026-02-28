'use client'
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { showErrorAlert, showSuccessAlert } from '@/utils/customFunction';
import { useRouter } from 'next/navigation';
import { useSchoolData } from '../layout';

const TRANSPORT_FEE_DISTANCES = [
    { key: 'below3', label: 'Below 3 KM' },
    { key: 'between3and5', label: '3 - 5 KM' },
    { key: 'between5and10', label: '5 - 10 KM' },
    { key: 'above10', label: 'Above 10 KM' },
];

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolId: '',
        slogan: '',
        adminName: '',
        adminEmail: '',
        password: '',
        logoBase64: '',
        adminImageBase64: '',
        classes: [{ id: 1, name: '', tuitionFee: '', admissionFee: '' }],
        transportFees: {
            below3: '',
            between3and5: '',
            between5and10: '',
            above10: '',
        },
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const router = useRouter();
    const { refetchSchoolData } = useSchoolData();

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/settings');
                const result = await response.json();

                if (result.success && result.data) {
                    const data = result.data;
                    setIsExisting(true);

                    const transformedClasses = data.classes?.map((cls: any, index: number) => ({
                        id: cls.id || index + 1,
                        name: cls.name || '',
                        tuitionFee: cls.tuitionFee?.toString() || '',
                        admissionFee: cls.admissionFee?.toString() || '',
                    })) || [{ id: 1, name: '', tuitionFee: '', admissionFee: '' }];

                    const transportFees = {
                        below3: data.transportFeeBelow3?.toString() || '',
                        between3and5: data.transportFeeBetween3and5?.toString() || '',
                        between5and10: data.transportFeeBetween5and10?.toString() || '',
                        above10: data.transportFeeAbove10?.toString() || '',
                    };

                    setFormData({
                        schoolName: data.schoolName || '',
                        schoolId: data.schoolId || '',
                        slogan: data.slogan || '',
                        adminName: data.adminName || '',
                        adminEmail: data.adminEmail || '',
                        password: data.password || '',
                        logoBase64: data.logoBase64 || '',
                        adminImageBase64: data.adminImageBase64 || '',
                        classes: transformedClasses,
                        transportFees,
                    });
                } else {
                    console.log('No existing settings found, using defaults');
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                showErrorAlert('Error', 'Failed to load existing settings');
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: 'logoBase64' | 'adminImageBase64'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClassChange = (id: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.map(cls =>
                cls.id === id ? { ...cls, [field]: value } : cls
            ),
        }));
    };

    const handleTransportFeeChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            transportFees: {
                ...prev.transportFees,
                [key]: value,
            },
        }));
    };

    const addClass = () => {
        setFormData(prev => ({
            ...prev,
            classes: [...prev.classes, { id: Date.now(), name: '', tuitionFee: '', admissionFee: '' }],
        }));
    };

    const removeClass = (id: number) => {
        if (formData.classes.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.filter(cls => cls.id !== id),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        try {
            setSaving(true);
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            if (json.success) {
                showSuccessAlert('Success', 'Settings saved successfully');
                setIsExisting(true);
                await refetchSchoolData();
                router.push('/dashboard');
            } else {
                showErrorAlert('Error', json.error || 'Error saving settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showErrorAlert('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const { schoolName, schoolId, slogan, adminName, adminEmail, password, classes, transportFees } = formData;

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card className="shadow-lg rounded-xl overflow-hidden py-0">
                    <CardHeader className="bg-primary/5 py-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">School Settings</CardTitle>
                        <p className="text-muted-foreground">Manage your school&apos;s profile, classes, and fees</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading settings...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg rounded-xl overflow-hidden py-0">
                <CardHeader className="bg-primary/5 py-2">
                    <CardTitle className="text-3xl font-bold tracking-tight">School Settings</CardTitle>
                    <p className="text-muted-foreground">Manage your school&apos;s profile, classes, and fees</p>
                </CardHeader>

                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* School Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">School Information</h3>
                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>School Logo</Label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'logoBase64')}
                                    />
                                    <p className="text-sm text-muted-foreground">Recommended size: 200x200</p>
                                    {formData.logoBase64 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img
                                                src={formData.logoBase64}
                                                alt="School Logo Preview"
                                                className="w-16 h-16 object-contain border rounded"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFormData(prev => ({ ...prev, logoBase64: '' }))}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">School Name*</Label>
                                    <Input name="schoolName" value={schoolName} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slogan">Slogan</Label>
                                    <Input name="slogan" value={slogan} onChange={handleChange} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="schoolId">School ID*</Label>
                                    <Input
                                        name="schoolId"
                                        value={schoolId}
                                        onChange={handleChange}
                                        required
                                        disabled={isExisting}
                                        className={isExisting ? 'bg-muted cursor-not-allowed' : ''}
                                    />
                                    {isExisting && (
                                        <p className="text-xs text-muted-foreground">School ID cannot be changed once set.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transport Fees Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Transport Fees (per month)</h3>
                            <Separator />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {TRANSPORT_FEE_DISTANCES.map(({ key, label }) => (
                                    <div key={key} className="space-y-2">
                                        <Label>{label}</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1.5 text-muted-foreground">₹</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={transportFees[key as keyof typeof transportFees]}
                                                onChange={e => handleTransportFeeChange(key, e.target.value)}
                                                className="pl-8"
                                                placeholder="Enter fee"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Classes and Fees */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Classes &amp; Fees</h3>
                                <Button type="button" onClick={addClass} variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Class
                                </Button>
                            </div>
                            <Separator />

                            <div className="space-y-4">
                                {classes.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end border rounded-lg p-4"
                                    >
                                        <div className="sm:col-span-4 space-y-2">
                                            <Label>Class Name*</Label>
                                            <Input
                                                value={cls.name}
                                                onChange={(e) => handleClassChange(cls.id, 'name', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="sm:col-span-3 space-y-2">
                                            <Label>Tuition Fee*</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1.5 text-muted-foreground">₹</span>
                                                <Input
                                                    type="number"
                                                    value={cls.tuitionFee}
                                                    onChange={(e) => handleClassChange(cls.id, 'tuitionFee', e.target.value)}
                                                    className="pl-8"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3 space-y-2">
                                            <Label>Admission Fee*</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1.5 text-muted-foreground">₹</span>
                                                <Input
                                                    type="number"
                                                    value={cls.admissionFee}
                                                    onChange={(e) => handleClassChange(cls.id, 'admissionFee', e.target.value)}
                                                    className="pl-8"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeClass(cls.id)}
                                                disabled={classes.length <= 1}
                                                className={
                                                    classes.length <= 1
                                                        ? 'opacity-50'
                                                        : 'text-destructive hover:text-destructive'
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Administrator Details</h3>
                            <Separator />

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Admin Name*</Label>
                                    <Input name="adminName" value={adminName} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Admin Email*</Label>
                                    <Input
                                        name="adminEmail"
                                        type="email"
                                        value={adminEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Admin Image</Label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'adminImageBase64')}
                                    />
                                    {formData.adminImageBase64 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img
                                                src={formData.adminImageBase64}
                                                alt="Admin Image Preview"
                                                className="w-16 h-16 object-cover border rounded"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFormData(prev => ({ ...prev, adminImageBase64: '' }))}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Password*</Label>
                                    <Input
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-4 text-lg"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save All Settings'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
