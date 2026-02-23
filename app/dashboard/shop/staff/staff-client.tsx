'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaffList } from './staff-list'
import { AttendanceList } from './attendance-list'
import { LeavesList } from './leaves-list'
import { useStaff } from '@/hooks/use-staff'

interface StaffClientProps {
    shop: any
}

export function StaffClient({ shop }: StaffClientProps) {
    const {
        staff,
        attendance,
        leaves,
        stats,
        loading,
        refresh,
        handleCreateAttendance,
        handleCreateLeave,
        handleUpdateLeaveStatus
    } = useStaff(shop.id)

    return (
        <div className="space-y-6">
            <Tabs defaultValue="staff" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="staff">স্টাফ ({stats.totalStaff})</TabsTrigger>
                    <TabsTrigger value="attendance">উপস্থিতি</TabsTrigger>
                    <TabsTrigger value="leaves">ছুটি ({stats.totalPendingLeaves})</TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-4">
                    <StaffList shopId={shop.id} />
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    <AttendanceList
                        attendance={attendance}
                        staff={staff || []}
                        shopId={shop.id}
                        onSuccess={refresh}
                        onCreateAttendance={handleCreateAttendance}
                    />
                </TabsContent>

                <TabsContent value="leaves" className="space-y-4">
                    <LeavesList
                        leaves={leaves}
                        staff={staff || []}
                        shopId={shop.id}
                        onSuccess={refresh}
                        onCreateLeave={handleCreateLeave}
                        onUpdateStatus={handleUpdateLeaveStatus}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
