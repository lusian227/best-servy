# EngineerOS System Architecture

## Overview
EngineerOS is an engineering document management system built on a domain-driven architecture.

## Architecture Principles
1. Records are the atomic unit (not documents)
2. Build from inside out (Domain → Database → Services → API → UI)
3. Events drive everything
4. Async processing for all heavy operations
5. RBAC + ABAC for permissions
