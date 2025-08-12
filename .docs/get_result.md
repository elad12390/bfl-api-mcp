# Get Result

> An endpoint for getting generation task result.

## OpenAPI

````yaml https://api.bfl.ai/openapi.json get /v1/get_result
paths:
  path: /v1/get_result
  method: get
  servers:
    - url: https://api.bfl.ai
      description: BFL API
  request:
    security: []
    parameters:
      path: {}
      query:
        id:
          schema:
            - type: string
              required: true
              title: Id
      header: {}
      cookie: {}
    body: {}
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              id:
                allOf:
                  - type: string
                    title: Id
                    description: Task id for retrieving result
              status:
                allOf:
                  - $ref: '#/components/schemas/StatusResponse'
              result:
                allOf:
                  - anyOf:
                      - {}
                      - type: 'null'
                    title: Result
              progress:
                allOf:
                  - anyOf:
                      - type: number
                      - type: 'null'
                    title: Progress
              details:
                allOf:
                  - anyOf:
                      - additionalProperties: true
                        type: object
                      - type: 'null'
                    title: Details
              preview:
                allOf:
                  - anyOf:
                      - additionalProperties: true
                        type: object
                      - type: 'null'
                    title: Preview
            title: ResultResponse
            refIdentifier: '#/components/schemas/ResultResponse'
            requiredProperties:
              - id
              - status
        examples:
          example:
            value:
              id: <string>
              status: Task not found
              result: <any>
              progress: 123
              details: {}
              preview: {}
        description: Successful Response
    '422':
      application/json:
        schemaArray:
          - type: object
            properties:
              detail:
                allOf:
                  - items:
                      $ref: '#/components/schemas/ValidationError'
                    type: array
                    title: Detail
            title: HTTPValidationError
            refIdentifier: '#/components/schemas/HTTPValidationError'
        examples:
          example:
            value:
              detail:
                - loc:
                    - <string>
                  msg: <string>
                  type: <string>
        description: Validation Error
  deprecated: false
  type: path
components:
  schemas:
    StatusResponse:
      type: string
      enum:
        - Task not found
        - Pending
        - Request Moderated
        - Content Moderated
        - Ready
        - Error
      title: StatusResponse
    ValidationError:
      properties:
        loc:
          items:
            anyOf:
              - type: string
              - type: integer
          type: array
          title: Location
        msg:
          type: string
          title: Message
        type:
          type: string
          title: Error Type
      type: object
      required:
        - loc
        - msg
        - type
      title: ValidationError

````