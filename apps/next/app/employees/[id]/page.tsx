'use client'

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useEmployees, useCompanies, useOrders } from '@my-app/api';
import { createParam } from 'solito';
import { OrderCard } from 'app/features/orders/order-card';

const { useParam } = createParam<{ id: string }>();

export default function EmployeeDetailPage() {
    const [id] = useParam('id');
    const { data: companies = [] } = useCompanies();
    const { data: employees = [] } = useEmployees();
    const employee = employees.find(e => e.id === id);
    const company = companies.find(c => c.id === employee?.companyId);
    const { data: orders = [] } = useOrders();

    const employeeOrders = orders.filter(o => o.employeeId === id);

    if (!employee) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#6b7280' }}>Employee not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%', padding: 32 }}>
                <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 40, marginBottom: 32, border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', alignItems: 'center' }}>
                    <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '4px solid #fed7aa' }}>
                        <Text style={{ fontSize: 48 }}>👤</Text>
                    </View>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>{employee.name}</Text>
                    <Text style={{ fontSize: 18, color: '#ea580c', fontWeight: '600', marginBottom: 16 }}>{employee.position || 'Employee'}</Text>

                    <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 32 }}>
                        <Text style={{ color: '#4b5563', fontSize: 16 }}>🏢 {company?.name || 'Unknown Company'}</Text>
                    </View>

                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', borderTop: '1px solid #f3f4f6', paddingTop: 32 }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>{employeeOrders.length}</Text>
                            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Orders</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
                                ${employeeOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                            </Text>
                            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Spent</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>#{company?.floorNumber || '-'}</Text>
                            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Floor</Text>
                        </View>
                    </View>
                </View>

                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>Order History</Text>
                {employeeOrders.length > 0 ? (
                    employeeOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))
                ) : (
                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 48, alignItems: 'center', border: '1px dashed #d1d5db' }}>
                        <Text style={{ color: '#9ca3af', fontSize: 16 }}>This employee hasn't placed any orders yet.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
