import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import axios from '@/utils/axios';
import { useAuthContext } from './AuthContext';

const WorkspaceContext = createContext(null);

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Fetch user's workspaces
  const { data: workspaces, isLoading: loadingWorkspaces } = useQuery(
    'workspaces',
    async () => {
      const response = await axios.get('/api/workspaces');
      return response.data.data.workspaces;
    },
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching workspaces:', error);
        toast.error('Failed to fetch workspaces');
      }
    }
  );

  // Set initial workspace
  useEffect(() => {
    if (workspaces?.length && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces]);

  // Create new workspace
  const createWorkspaceMutation = useMutation(
    async (workspaceData) => {
      const response = await axios.post('/api/workspaces', workspaceData);
      return response.data.data.workspace;
    },
    {
      onSuccess: (newWorkspace) => {
        queryClient.setQueryData('workspaces', (old) => [...(old || []), newWorkspace]);
        setCurrentWorkspace(newWorkspace);
        toast.success('Workspace created successfully!');
      },
      onError: (error) => {
        console.error('Error creating workspace:', error);
        toast.error(error.response?.data?.message || 'Failed to create workspace');
      }
    }
  );

  // Update workspace
  const updateWorkspaceMutation = useMutation(
    async ({ workspaceId, data }) => {
      const response = await axios.patch(`/api/workspaces/${workspaceId}`, data);
      return response.data.data.workspace;
    },
    {
      onSuccess: (updatedWorkspace) => {
        queryClient.setQueryData('workspaces', (old) =>
          old.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w))
        );
        if (currentWorkspace?.id === updatedWorkspace.id) {
          setCurrentWorkspace(updatedWorkspace);
        }
        toast.success('Workspace updated successfully!');
      },
      onError: (error) => {
        console.error('Error updating workspace:', error);
        toast.error(error.response?.data?.message || 'Failed to update workspace');
      }
    }
  );

  // Add workspace member
  const addMemberMutation = useMutation(
    async ({ workspaceId, memberData }) => {
      const response = await axios.post(`/api/workspaces/${workspaceId}/members`, memberData);
      return response.data.data.user;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['workspace-members', currentWorkspace?.id]);
        toast.success('Member added successfully!');
      },
      onError: (error) => {
        console.error('Error adding member:', error);
        toast.error(error.response?.data?.message || 'Failed to add member');
      }
    }
  );

  // Remove workspace member
  const removeMemberMutation = useMutation(
    async ({ workspaceId, userId }) => {
      await axios.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
      return userId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['workspace-members', currentWorkspace?.id]);
        toast.success('Member removed successfully!');
      },
      onError: (error) => {
        console.error('Error removing member:', error);
        toast.error(error.response?.data?.message || 'Failed to remove member');
      }
    }
  );

  // Update member role
  const updateMemberRoleMutation = useMutation(
    async ({ workspaceId, userId, role }) => {
      const response = await axios.patch(`/api/workspaces/${workspaceId}/members/${userId}`, { role });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['workspace-members', currentWorkspace?.id]);
        toast.success('Member role updated successfully!');
      },
      onError: (error) => {
        console.error('Error updating member role:', error);
        toast.error(error.response?.data?.message || 'Failed to update member role');
      }
    }
  );

  // Create subscription order
  const createSubscriptionOrderMutation = useMutation(
    async ({ workspaceId, planId }) => {
      const response = await axios.post(`/api/workspaces/${workspaceId}/subscription/order`, { planId });
      return response.data.data.order;
    },
    {
      onSuccess: (order) => {
        // Handle Razorpay integration
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Task Management SaaS',
          description: 'Workspace Subscription',
          order_id: order.id,
          handler: (response) => {
            verifyPaymentMutation.mutate({
              workspaceId: currentWorkspace.id,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      },
      onError: (error) => {
        console.error('Error creating subscription order:', error);
        toast.error(error.response?.data?.message || 'Failed to create subscription order');
      }
    }
  );

  // Verify payment
  const verifyPaymentMutation = useMutation(
    async ({ workspaceId, paymentId, orderId, signature }) => {
      const response = await axios.post(`/api/workspaces/${workspaceId}/subscription/verify`, {
        paymentId,
        orderId,
        signature
      });
      return response.data.data.workspace;
    },
    {
      onSuccess: (updatedWorkspace) => {
        queryClient.setQueryData('workspaces', (old) =>
          old.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w))
        );
        if (currentWorkspace?.id === updatedWorkspace.id) {
          setCurrentWorkspace(updatedWorkspace);
        }
        toast.success('Subscription payment successful!');
      },
      onError: (error) => {
        console.error('Error verifying payment:', error);
        toast.error(error.response?.data?.message || 'Failed to verify payment');
      }
    }
  );

  const value = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    loadingWorkspaces,
    createWorkspace: createWorkspaceMutation.mutate,
    updateWorkspace: updateWorkspaceMutation.mutate,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    updateMemberRole: updateMemberRoleMutation.mutate,
    createSubscriptionOrder: createSubscriptionOrderMutation.mutate,
    verifyPayment: verifyPaymentMutation.mutate
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export default WorkspaceContext;
