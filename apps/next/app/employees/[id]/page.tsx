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
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
            }}>
                <Text style={{ fontSize: 18, color: '#78716c', fontWeight: '600' }}>Employee not found</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
            contentContainerStyle={{ paddingVertical: 40 }}
        >
            <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%', padding: 40 }}>
                <View style={{
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                    borderRadius: 20,
                    padding: 40,
                    marginBottom: 32,
                    borderWidth: 1,
                    borderColor: '#e7e5e4',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.05,
                    shadowRadius: 20,
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                        borderWidth: 2,
                        borderColor: '#fed7aa',
                    }}>
                        <Text style={{ fontSize: 48 }}>👤</Text>
                    </View>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#1c1917', marginBottom: 6 }}>{employee.name}</Text>
                    <Text style={{ fontSize: 18, color: '#b45309', fontWeight: '600', marginBottom: 20 }}>{employee.position || 'Employee'}</Text>

                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 14,
                        marginBottom: 32,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                    }}>
                        <Text style={{ color: '#44403c', fontSize: 16, fontWeight: '600' }}>🏢 {company?.name || 'Unknown Company'}</Text>
                    </View>

                    <View style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        borderTopWidth: 1,
                        borderTopColor: '#f5f5f4',
                        paddingTop: 32,
                    }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1c1917' }}>{employeeOrders.length}</Text>
                            <Text style={{ color: '#78716c', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Orders</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1c1917' }}>
                                ETB {employeeOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                            </Text>
                            <Text style={{ color: '#78716c', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Spent</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1c1917' }}>#{company?.floorNumber || '-'}</Text>
                            <Text style={{ color: '#78716c', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Floor</Text>
                        </View>
                    </View>
                </View>

                <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 20, color: '#1c1917' }}>Order History</Text>
                {employeeOrders.length > 0 ? (
                    employeeOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))
                ) : (
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        borderRadius: 20,
                        padding: 48,
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: '#e7e5e4',
                        borderStyle: 'dashed',
                    }}>
                        <Text style={{ color: '#78716c', fontSize: 16 }}>This employee hasn't placed any orders yet.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
