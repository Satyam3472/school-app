"use client"

import React, { Component, ReactNode } from "react"

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="p-6 text-center">
                        <p className="text-destructive font-medium">Something went wrong.</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            {this.state.error?.message ?? "An unexpected error occurred."}
                        </p>
                        <button
                            className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
                            onClick={() => this.setState({ hasError: false, error: undefined })}
                        >
                            Try again
                        </button>
                    </div>
                )
            )
        }
        return this.props.children
    }
}
