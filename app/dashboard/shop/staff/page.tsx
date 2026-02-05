import { getUserShop } from '@/lib/get-user-shop'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStaff, getAttendance, getLeaves } from '@/app/actions/staff'
import { StaffList } from './staff-list'
import { AttendanceList } from './attendance-list'
import { LeavesList } from './leaves-list'

export default async function StaffPage() {
  const { shop } = await getUserShop()
  const currentShop = shop; // Declare the currentShop variable

  const [staff, attendance, leaves] = await Promise.all([
    getStaff(shop.id),
    getAttendance(shop.id),
    getLeaves(shop.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground">Manage employees, attendance, and leaves</p>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff ({staff?.length || 0})</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves ({leaves?.filter(l => l.status === 'pending').length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff" className="space-y-4">
          <StaffList staff={staff || []} shopId={shop.id} />
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <AttendanceList attendance={attendance || []} staff={staff || []} shopId={shop.id} />
        </TabsContent>
        
        <TabsContent value="leaves" className="space-y-4">
          <LeavesList leaves={leaves || []} staff={staff || []} shopId={shop.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
