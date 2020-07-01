/**
 * Validation exception
 * Indicates invalid data across the domain
 */
export class ValidationException {
    constructor(
        public property: string,
        public value: unknown,
        public constraints: { [type: string]: string; },
        public children: ValidationException[] = [],
    ) {}

    toString(hasParent: boolean = false, parentPath: string = ''): string {
        return this.formatMessage(parentPath) +
            this.children
                .map(childException => {
                    const formattedProperty = hasParent
                        ? `${parentPath}${this.formatProperty(parentPath)}`
                        : this.property;
                    return childException.toString(true, formattedProperty);
                })
                .join('');
    }

    private formatMessage(parentPath: string = '') {
        if (!this.constraints) {
            return '';
        }

        const propertyPath = `${parentPath ? `${parentPath}.` : ''}${this.property}`;
        const messages = `\n - ${Object.values(this.constraints).join('\n - ')}\n`;

        return `"${propertyPath}" has invalid constraints:${messages}\n`;
    }

    private formatProperty(parentPath: string = '') {
        return Number.isInteger(+this.property)
            ? `[${this.property}]`
            : `${parentPath ? '.' : ''}${this.property}`;
    }
}
