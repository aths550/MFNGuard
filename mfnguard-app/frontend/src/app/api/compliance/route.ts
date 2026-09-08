/**
 * ============================================================================
 * DEPRECATED / ORPHANED — DO NOT USE IN PRODUCTION
 * ============================================================================
 * This server-side route was created during early prototyping before the
 * real client-side ZK proving flow was implemented. It accepts plaintext
 * private data (prices, salts) via HTTP POST and returns a hardcoded mock
 * response. It is NOT called by any frontend component.
 *
 * It should be removed entirely before any production deployment, or
 * replaced with a real MPC/co-proving backend if server-side proof
 * generation is ever needed.
 * ============================================================================
 *
 * ORIGINAL TRUST ASSUMPTION: 
 * This proof server acts as a trusted third party for the duration of this request.
 * It briefly holds the plaintext price and salt inputs from both the buyer and the supplier
 * in memory in order to generate the zero-knowledge proof. 
 * Once the proof is generated and the transaction is submitted, these plaintext inputs 
 * are discarded. They are never logged, persisted, or cached.
 * 
 * In a production environment, this should be replaced with a Multi-Party Computation (MPC) 
 * setup or a co-proving protocol to remove this centralized trust assumption.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // We intentionally DO NOT log the body or any of its contents.
    
    const {
      class_id,
      buyer_price,
      buyer_salt,
      supplier_prices,
      supplier_salts
    } = body;

    if (!class_id || buyer_price === undefined || !buyer_salt || !supplier_prices || !supplier_salts) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Connect to Midnight network/wallet
    // TODO: Instantiate contract
    // TODO: Call contract.impureCircuits.compliance_check
    
    // Mock response for now until wallet integration is complete
    return NextResponse.json({
      compliant: true,
      discrepancy: 0
    });

  } catch (error) {
    // Ensure we do not accidentally log any request data in the error handler
    console.error("Error in compliance_check API route");
    return NextResponse.json({ error: "Internal server error during proof generation" }, { status: 500 });
  }
}
