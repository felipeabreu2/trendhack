"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Loader2 } from "lucide-react";

interface Signature {
  name: string;
}

interface Payment {
  id: string;
  created_at: string;
  value: number;
  signature?: Signature | null; // Join with signature table to get plan name
  method?: string | null; // Adicionar a coluna method
  gemas?: number | null; // Adicionar a coluna gemas
  // Adicionar outros campos relevantes da tabela payments, se houver (ex: status, gemas, etc.)
}

// Define interface for the Supabase Realtime payload for payments table
interface PaymentUpdatePayload {
  commit_timestamp: string;
  eventType: '*'; // Or specific event like 'UPDATE'
  new: Payment; // The new data matches the Payment interface
  old: { id: string }; // Old data, minimum is the primary key
  schema: 'public';
  table: 'payments';
  errors: any[]; // Supabase payload can include errors
}

interface PaymentsHistoryProps {
  userId: string;
}

export default function PaymentsHistory({ userId }: PaymentsHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Buscar pagamentos do usuário logado
        // Assumindo que a tabela `payments` tem uma coluna `user_id` referenciando a tabela `users`
        // Se a sua tabela payments estiver relacionada com user_request ou assinatura, ajuste a query aqui.
        // Exemplo: Se payments estiver relacionada com user_request e user_request tiver user_id:
        const { data, error } = await supabase
          .from('payments')
          .select('id, created_at, value, signature(name), method, gemas') // Incluir a coluna method e gemas
          .eq('user', userId) // Filtrar diretamente pela coluna 'user'
          .eq('status', 'paid') // Adicionar filtro por status
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching payments:", error);
          setError(error.message);
        } else {
          // Certificar que o campo signature é um objeto com 'name' e tipar corretamente
          const formattedData = data.map((payment: Payment) => ({
            ...payment,
            signature: payment.signature ? { name: payment.signature.name } : null,
            method: payment.method || null, // Incluir o campo method
            gemas: payment.gemas || 0, // Incluir o campo gemas
          }));
          setPayments(formattedData as Payment[]);
        }
      } catch (err: any) {
        console.error("Error fetching payments:", err);
        setError(err.message || "Erro ao carregar histórico de pagamentos.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchPayments();
    }

    // Configurar assinatura em tempo real para a tabela payments
    // Assumindo que a tabela payments tem uma coluna user_id e RLS está configurado
    const paymentChannel = supabase
      .channel('payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` }, // Ajustar filtro se a relação for diferente
        (payload: PaymentUpdatePayload) => {
          console.log('Payment change received!', payload);
          // Refetch os dados para manter a lista atualizada
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentChannel);
    };

  }, [userId, supabase]); // Adicionar supabase como dependência do useEffect

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Retorna a string original em caso de erro
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando histórico...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center">Erro: {error}</div>
        )}
        {!isLoading && !error && payments.length === 0 && (
          <div className="text-center text-gray-500">Nenhuma transação encontrada.</div>
        )}
        {!isLoading && !error && payments.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                    <TableCell>{payment.signature?.name || payment.method || "N/A"}</TableCell>
                    <TableCell>{payment.gemas}</TableCell>
                    <TableCell>{`R$ ${payment.value.toFixed(2).replace('.', ',')}`}</TableCell>         
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 