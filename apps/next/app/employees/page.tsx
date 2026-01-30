'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useEmployees, useCompanies, useCreateEmployee, useUpdateEmployee, useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';

export default function EmployeesPage() {
    const { user, companyId, companyName, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const { data: employees = [], isLoading: employeesLoading } = useEmployees(companyId || undefined);
    const createEmployee = useCreateEmployee();
    const updateEmployee = useUpdateEmployee();

    const [showForm, setShowForm] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');

    // Security: Only allow authenticated company admins
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading]);

    const displayHeader = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Company';

    const handleEditEmployee = (employee: any) => {
        setEditingEmployeeId(employee.id);
        setName(employee.name);
        setEmail(employee.email);
        setPhone(employee.phone || '');
        setPosition(employee.position || '');
        setShowForm(true);

        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveEmployee = async () => {
        if (!companyId) return;
        if (!name || !email) {
            alert('Please fill in required fields (Name, Email)');
            return;
        }

        try {
            if (editingEmployeeId) {
                await updateEmployee.mutateAsync({
                    id: editingEmployeeId,
                    name,
                    email,
                    phone,
                    position
                });
                alert('Employee updated successfully!');
            } else {
                await createEmployee.mutateAsync({
                    name,
                    email,
                    phone,
                    companyId,
                    position
                });
                alert('Employee added successfully!');
            }
            setShowForm(false);
            setEditingEmployeeId(null);
            setName('');
            setEmail('');
            setPhone('');
            setPosition('');
        } catch (error) {
            console.error('Error saving employee:', error);
            alert('Failed to save employee. Email might already be registered.');
        }
    };

    if (authLoading || employeesLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#6b7280' }}>Verifying authorization...</Text>
            </View>
        );
    }

    if (!user || !companyId) return null;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={{ maxWidth: 1280, width: '100%', padding: 40, alignItems: 'center' }}>
                <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
                    <Text style={{ fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: -1.5, textAlign: 'center', marginBottom: 12 }}>{displayHeader} Staff 👥</Text>
                    <Text style={{ color: '#6b7280', fontSize: 20, fontWeight: '500', textAlign: 'center', marginBottom: 32 }}>Manage your office team and their contact details</Text>

                    <Pressable
                        onPress={() => {
                            if (showForm) {
                                setShowForm(false);
                                setEditingEmployeeId(null);
                                setName('');
                                setEmail('');
                                setPhone('');
                                setPosition('');
                            } else {
                                setShowForm(true);
                            }
                        }}
                        style={{ backgroundColor: '#111827', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{showForm ? 'Cancel Registration' : '+ Register New Employee'}</Text>
                    </Pressable>
                </View>

                {showForm && (
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 20,
                        padding: 32,
                        marginBottom: 32,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderStyle: 'solid',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                    }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#111827' }}>
                            {editingEmployeeId ? 'Edit Team Member' : 'Add New Team Member'}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
                            <View style={{ flex: 1, minWidth: 300 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>Full Name *</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16, color: '#111827' }}
                                    placeholder="e.g. Sarah Wilson"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 300 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>Work Email *</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16, color: '#111827' }}
                                    placeholder="sarah@yourcompany.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 300 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>Phone Number</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16, color: '#111827' }}
                                    placeholder="e.g. +251 9XX XXX XXX"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 300 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>Position/Role</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16, color: '#111827' }}
                                    placeholder="e.g. Account Manager"
                                    value={position}
                                    onChangeText={setPosition}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32 }}>
                            <Pressable
                                onPress={handleSaveEmployee}
                                style={{ backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                    {editingEmployeeId ? 'Update Employee' : 'Save Employee Details'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderStyle: 'solid',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 10,
                }}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#f9fafb',
                        padding: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: '#e5e7eb',
                        borderBottomStyle: 'solid'
                    }}>
                        <Text style={{ flex: 2, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>Staff Member</Text>
                        <Text style={{ flex: 2, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>Contact Information</Text>
                        <Text style={{ flex: 1.5, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>Role</Text>
                        <Text style={{ width: 100, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5, textAlign: 'right' }}>Action</Text>
                    </View>
                    {employees.map((employee) => (
                        <View key={employee.id} style={{
                            flexDirection: 'row',
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f3f4f6',
                            borderBottomStyle: 'solid',
                            alignItems: 'center'
                        }}>
                            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center', marginRight: 16, border: '2px solid #fed7aa' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ea580c' }}>{employee.name[0]}</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{employee.name}</Text>
                                    <Text style={{ fontSize: 12, color: '#6b7280' }}>ID: {employee.id.slice(0, 8)}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Text style={{ color: '#111827', fontWeight: '500' }}>{employee.email}</Text>
                                <Text style={{ color: '#6b7280', fontSize: 13 }}>{employee.phone || 'No phone added'}</Text>
                            </View>
                            <View style={{ flex: 1.5 }}>
                                <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' }}>
                                    <Text style={{ color: '#4b5563', fontSize: 13, fontWeight: '600' }}>{employee.position || 'Staff'}</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => handleEditEmployee(employee)}
                                style={{ width: 100, alignItems: 'flex-end' }}
                            >
                                <View style={{
                                    backgroundColor: '#f9fafb',
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#e5e7eb',
                                    borderStyle: 'solid'
                                }}>
                                    <Text style={{ color: '#ea580c', fontSize: 14, fontWeight: '700' }}>Edit</Text>
                                </View>
                            </Pressable>
                        </View>
                    ))}
                    {employees.length === 0 && (
                        <View style={{ padding: 80, alignItems: 'center' }}>
                            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Text style={{ fontSize: 48 }}>👥</Text>
                            </View>
                            <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>No staff members registered</Text>
                            <Text style={{ color: '#6b7280', fontSize: 16, textAlign: 'center', maxWidth: 400 }}>
                                Start building your team at {companyName || 'your company'} by adding your first employee.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
