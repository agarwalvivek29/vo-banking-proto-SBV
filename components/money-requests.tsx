"use client"

import { useAccount } from "@/context/account-context"
import { Trash2, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MoneyRequests() {
  const { moneyRequests, cancelRequest } = useAccount()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200"
      case "accepted":
        return "bg-green-50 border-green-200"
      case "declined":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "declined":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Money Requests</h1>
        <p className="text-gray-600">View and manage all money requests you've made</p>
      </div>

      {moneyRequests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600 text-lg">No money requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {moneyRequests.map((request) => (
            <div
              key={request.id}
              className={`border rounded-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${getStatusColor(request.status)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getStatusIcon(request.status)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{request.recipientName}</h3>
                  <p className="text-sm text-gray-600">
                    {request.date} at {request.time}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">₹{request.amount}</p>
                  <p className="text-sm text-gray-600">{getStatusText(request.status)}</p>
                </div>

                {request.status === "pending" && (
                  <Button
                    onClick={() => cancelRequest(request.id)}
                    variant="ghost"
                    className="bg-red-100 hover:bg-red-200 text-red-700 w-full md:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
