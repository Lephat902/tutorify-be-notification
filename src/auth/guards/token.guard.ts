import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { TokenRequirementsHelper } from '../decorators';
import { getRequest } from '../helpers';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) { }

  /**
   * Determines whether the request is allowed to proceed.
   * @param context The execution context.
   * @returns A boolean indicating whether the request can proceed.
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve token requirements set by decorators
    const tokenRequirements = this.reflector.get<TokenRequirementsHelper>(
      'tokenrequirements',
      context.getHandler(),
    );

    // If no bearer token is present in the request
    if (!this.isBearerTokenPresent(context)) {
      // If the current action doesn't require a token, allow access; otherwise, deny it
      return !tokenRequirements;
    }

    // Extract and validate the bearer token
    const token = this.extractBearerToken(context);
    const decodedToken = this.authService.validateAccessToken(token);

    try {
      // Assign the decoded token to the request for later access
      this.assignTokenToRequest(context, decodedToken);

      // If the endpoint doesn't require any specific roles, allow access
      if (!tokenRequirements) {
        return true;
      }

      // If the token meets the required type and contains all the necessary roles, allow access
      if (
        tokenRequirements.tokenIsOfType(decodedToken.type) &&
        tokenRequirements.tokenHasAllUserRoles(decodedToken.roles)
      ) {
        return true;
      }

      // Deny access if the token requirements are not met
      return false;
    } catch (err) {
      // Deny access in case of any errors during token validation
      return false;
    }
  }

  /**
   * Assigns the token to the request object for later access.
   * @param context The execution context.
   * @param token The decoded token object.
   */
  private assignTokenToRequest(context: ExecutionContext, token: any): void {
    const req = getRequest(context);
    req.token = token;
  }

  /**
   * Checks if a bearer token is present in the request headers.
   * @param context The execution context.
   * @returns A boolean indicating whether a bearer token is present.
   */
  private isBearerTokenPresent(context: ExecutionContext): boolean {
    const req = getRequest(context);
    return req.headers.authorization?.startsWith('Bearer');
  }

  /**
   * Extracts the bearer token from the request headers.
   * @param context The execution context.
   * @returns The bearer token string or null if not found.
   */
  private extractBearerToken(context: ExecutionContext): string | null {
    const req = getRequest(context);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' ? token : null;
  }
}
