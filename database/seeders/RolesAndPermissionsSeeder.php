<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'admin.access',
            'billing.view',
            'billing.manage',
            'users.view',
            'users.manage',
            'workspaces.view',
            'workspaces.manage',
            'calendar.view',
            'calendar.manage',
            'messages.manage',
            'expenses.view',
            'expenses.manage',
            'expenses.accept',
            'custody.manage',
            'announcements.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $admin = Role::findOrCreate('admin', 'web');
        $familyOwner = Role::findOrCreate('family-owner', 'web');
        $familyCoparent = Role::findOrCreate('family-coparent', 'web');
        $familyMember = Role::findOrCreate('family-member', 'web');
        $caregiver = Role::findOrCreate('caregiver', 'web');

        $admin->syncPermissions($permissions);
        $familyOwner->syncPermissions([
            'billing.view',
            'billing.manage',
            'workspaces.view',
            'workspaces.manage',
            'calendar.view',
            'calendar.manage',
            'messages.manage',
            'expenses.view',
            'expenses.manage',
            'expenses.accept',
            'custody.manage',
        ]);
        $familyCoparent->syncPermissions([
            'workspaces.view',
            'calendar.view',
            'calendar.manage',
            'messages.manage',
            'expenses.view',
            'expenses.manage',
        ]);
        $familyMember->syncPermissions([
            'workspaces.view',
            'calendar.view',
            'calendar.manage',
            'messages.manage',
            'expenses.view',
            'expenses.manage',
        ]);
        $caregiver->syncPermissions([
            'workspaces.view',
            'calendar.view',
        ]);
    }
}
