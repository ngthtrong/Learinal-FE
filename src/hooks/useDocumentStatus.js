/**
 * useDocumentStatus Hook
 * Poll document processing status with automatic refresh
 */

import { useState, useEffect, useCallback, useRef } from "react";
import documentsService from "@/services/api/documents.service";

const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_ATTEMPTS = 100; // Max 5 minutes

export function useDocumentStatus(documentId, options = {}) {
  const { enabled = true, onStatusChange, onComplete, onError } = options;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);

  const pollCountRef = useRef(0);
  const intervalRef = useRef(null);
  const previousStatusRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!documentId || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      const data = await documentsService.getDocumentById(documentId);
      setDocument(data);
      setStatus(data.status);

      // Trigger status change callback
      if (previousStatusRef.current !== data.status && onStatusChange) {
        onStatusChange(data.status, previousStatusRef.current);
      }
      previousStatusRef.current = data.status;

      // Stop polling if completed or error
      if (data.status === "Completed") {
        stopPolling();
        if (onComplete) onComplete(data);
      } else if (data.status === "Error") {
        stopPolling();
        if (onError) onError(data.errorMessage || "Processing error");
      }

      pollCountRef.current += 1;

      // Stop after max attempts
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setError("Polling timeout");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch document status");
      stopPolling();
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [documentId, enabled, onStatusChange, onComplete, onError, stopPolling]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    // Initial fetch
    fetchStatus();

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, POLL_INTERVAL);
  }, [fetchStatus]);

  const refetch = useCallback(() => {
    pollCountRef.current = 0;
    fetchStatus();
  }, [fetchStatus]);

  // Auto-start polling
  useEffect(() => {
    if (enabled && documentId && status !== "Completed" && status !== "Error") {
      startPolling();
    }

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, enabled, status]);

  return {
    status,
    loading,
    error,
    document,
    refetch,
    startPolling,
    stopPolling,
  };
}

export default useDocumentStatus;
