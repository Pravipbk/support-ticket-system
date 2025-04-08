import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal, Mail, Phone, UserIcon, Edit, Key, UserX } from "lucide-react";

interface MemberCardProps {
  member: User;
}

export default function MemberCard({ member }: MemberCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  // In real app we would have mutation functions like these for admin actions
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      // This would make a request to reset user password
      // Since we're using mock data, just simulate success
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Password reset link sent",
        description: `A password reset link has been sent to ${member.email}`,
      });
      setIsResetOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send password reset link",
        variant: "destructive",
      });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async () => {
      // This would make a request to delete the user
      // Since we're using mock data, just simulate success
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Member deleted",
        description: `${member.name} has been removed from the team`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    }
  });

  const getRoleBadge = () => {
    switch (member.role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
      case "agent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Agent</Badge>;
      case "customer":
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Customer</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.name}</p>
              <div className="flex items-center text-sm text-slate-500">
                <UserIcon className="mr-1 h-3 w-3" /> @{member.username}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsResetOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                <span>Reset Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteOpen(true)}
                className="text-red-600"
              >
                <UserX className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="mr-2 h-4 w-4 text-slate-400" />
            <span>{member.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-4 w-4 text-slate-400" />
            <span>Not Available</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {getRoleBadge()}
          <span className="text-xs text-slate-500">
            {member.role === "admin" ? "Full access" : 
             member.role === "agent" ? "Limited access" : 
             "Customer account"}
          </span>
        </div>
      </CardContent>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will send a password reset link to {member.email}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => resetPasswordMutation.mutate()}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Member Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {member.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMemberMutation.mutate()}
              disabled={deleteMemberMutation.isPending}
            >
              {deleteMemberMutation.isPending ? "Deleting..." : "Delete Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Member Dialog - Not implemented in this demo */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Edit information for {member.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-slate-500">
              Edit functionality would be implemented here in a real application.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
