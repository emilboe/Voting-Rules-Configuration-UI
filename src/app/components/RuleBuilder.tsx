import React, { useState, useRef } from "react";
import { GripVertical, Plus, X, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type RuleOperator = "AND" | "OR";

type Condition = {
  id: string;
  title: string;
  field: string;
  operator: string;
  value: string;
};

type RuleGroup = {
  id: string;
  type: "group";
  operator: RuleOperator;
  conditions: (Condition | RuleGroup)[];
};

type RulesetGroup = {
  id: string;
  name: string;
  context: string;
  rules: RuleGroup;
};

const FIELD_OPTIONS = [
  { value: "vote_count", label: "Vote Count" },
  { value: "equity_share", label: "Equity Share (%)" },
  { value: "company", label: "Company" },
  { value: "exclude_company", label: "Exclude Company" },
  { value: "investor_type", label: "Investor Type" },
  { value: "board_seat", label: "Board Seat" },
  { value: "voting_rights", label: "Voting Rights" },
];

const OPERATOR_OPTIONS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_than", label: "is less than" },
  { value: "greater_equal", label: "is at least" },
  { value: "less_equal", label: "is at most" },
  { value: "contains", label: "contains" },
];

const INVESTOR_TYPES = [
  "Institutional",
  "Individual",
  "Strategic",
  "Venture Capital",
];
const COMPANIES = [
  "Acme Corp",
  "TechStart Inc",
  "Global Ventures",
  "Innovation Labs",
];

const ITEM_TYPE = "RULE_ITEM";

type DragItem = { index: number; id: string; groupId: string };

interface DraggableItemProps {
  id: string;
  index: number;
  groupId: string;
  moveItem: (
    groupId: string,
    dragIndex: number,
    hoverIndex: number,
  ) => void;
  children: React.ReactNode;
}

function DraggableItem({
  id,
  index,
  groupId,
  moveItem,
  children,
}: DraggableItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (
        dragIndex === hoverIndex &&
        item.groupId === groupId
      ) {
        return;
      }

      // Only allow reordering within the same group
      if (item.groupId !== groupId) {
        return;
      }

      const hoverBoundingRect =
        ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY =
        clientOffset!.y - hoverBoundingRect.top;

      if (
        dragIndex < hoverIndex &&
        hoverClientY < hoverMiddleY
      ) {
        return;
      }

      if (
        dragIndex > hoverIndex &&
        hoverClientY > hoverMiddleY
      ) {
        return;
      }

      moveItem(groupId, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: () => {
      return { id, index, groupId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-handler-id={handlerId != null ? String(handlerId) : undefined}
    >
      {children}
    </div>
  );
}

export function RuleBuilder() {
  const [rulesetGroups, setRulesetGroups] = useState<
    RulesetGroup[]
  >([
    {
      id: "1",
      name: "3 or 4 and d5 (35%) w/Petoro",
      context: "Default",
      rules: {
        id: "root",
        type: "group",
        operator: "AND",
        conditions: [
          {
            id: "1",
            title: "Exclude Petoro in procurement votes",
            field: "exclude_company",
            operator: "",
            value: "Petoro",
          },
          {
            id: "group-1",
            type: "group",
            operator: "OR",
            conditions: [
              {
                id: "group-2",
                type: "group",
                operator: "AND",
                conditions: [
                  {
                    id: "2",
                    title: "Minimum 3 companies",
                    field: "vote_count",
                    operator: "equals",
                    value: "3",
                  },
                  {
                    id: "3",
                    title: "More than 65% equity",
                    field: "equity_share",
                    operator: "greater_than",
                    value: "65",
                  },
                ],
              },
              {
                id: "group-3",
                type: "group",
                operator: "AND",
                conditions: [
                  {
                    id: "4",
                    title: "Minimum 4 companies",
                    field: "vote_count",
                    operator: "equals",
                    value: "4",
                  },
                  {
                    id: "5",
                    title: "More than 35% equity",
                    field: "equity_share",
                    operator: "greater_than",
                    value: "35",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: "2",
      name: "3 or 4 and d5 (35%) w/o Petoro",
      context: "Procurement",
      rules: {
        id: "root",
        type: "group",
        operator: "AND",
        conditions: [
          {
            id: "1",
            title: "At least 3 votes",
            field: "vote_count",
            operator: "greater_equal",
            value: "3",
          },
          {
            id: "2",
            title: "At least 65% equity",
            field: "equity_share",
            operator: "greater_equal",
            value: "65",
          },
          {
            id: "group-1",
            type: "group",
            operator: "OR",
            conditions: [
              {
                id: "3",
                title: "At least 4 votes",
                field: "vote_count",
                operator: "greater_equal",
                value: "4",
              },
              {
                id: "4",
                title: "At least 35% equity",
                field: "equity_share",
                operator: "greater_equal",
                value: "35",
              },
            ],
          },
          {
            id: "5",
            title: "Not Petoro",
            field: "company",
            operator: "not_equals",
            value: "Petoro",
          },
        ],
      },
    },
  ]);

  const [selectedRulesetId, setSelectedRulesetId] =
    useState("1");

  const selectedRuleset = rulesetGroups.find(
    (g) => g.id === selectedRulesetId,
  )!;
  const [rootGroup, setRootGroup] = useState<RuleGroup>(
    selectedRuleset.rules,
  );

  // Update rootGroup when switching rulesets
  const handleRulesetChange = (rulesetId: string) => {
    // Save current changes to the current ruleset
    setRulesetGroups((prev) =>
      prev.map((g) =>
        g.id === selectedRulesetId
          ? { ...g, rules: rootGroup }
          : g,
      ),
    );

    // Switch to new ruleset
    setSelectedRulesetId(rulesetId);
    const newRuleset = rulesetGroups.find(
      (g) => g.id === rulesetId,
    )!;
    setRootGroup(newRuleset.rules);
  };

  // Generate plain text description
  const generateRuleDescription = (group: RuleGroup): string => {
    const parts: string[] = [];
    
    const processCondition = (condition: Condition): string => {
      const fieldLabels: Record<string, string> = {
        vote_count: "vote count",
        equity_share: "equity share",
        company: "company",
        exclude_company: "exclude company",
        investor_type: "investor type",
        board_seat: "board seat",
        voting_rights: "voting rights",
      };

      const operatorLabels: Record<string, string> = {
        equals: "equals",
        not_equals: "does not equal",
        greater_than: "greater than",
        less_than: "less than",
        greater_equal: "at least",
        less_equal: "at most",
        contains: "contains",
      };

      const field = fieldLabels[condition.field] || condition.field;
      const operator = operatorLabels[condition.operator] || condition.operator;
      const value = condition.value;

      if (condition.field === "exclude_company") {
        return `exclude company ${value}`;
      } else if (condition.field === "equity_share") {
        return `${field} ${operator} ${value}%`;
      } else if (operator) {
        return `${field} ${operator} ${value}`;
      }
      return "";
    };

    const processGroup = (g: RuleGroup, depth: number = 0): string => {
      const subParts = g.conditions.map((item) => {
        if ("type" in item) {
          return `\n(${processGroup(item, depth + 1)})`;
        }
        return processCondition(item);
      }).filter(Boolean);

      const joinWord = g.operator === "AND" ? "\nand " : "\nor ";
      return subParts.join(joinWord);
    };

    const result = processGroup(group);
    // Add newline between consecutive closing parentheses
    return result.replace(/\)\)/g, ')\n)');
  };

  const ruleDescription = generateRuleDescription(rootGroup);

  const addCondition = (groupId: string) => {
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      title: "New Condition",
      field: "vote_count",
      operator: "equals",
      value: "",
    };

    const addToGroup = (group: RuleGroup): RuleGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [...group.conditions, newCondition],
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((item) =>
          "type" in item ? addToGroup(item) : item,
        ),
      };
    };

    setRootGroup(addToGroup(rootGroup));
  };

  const addGroup = (parentGroupId: string) => {
    const newGroup: RuleGroup = {
      id: `group-${Date.now()}`,
      type: "group",
      operator: "AND",
      conditions: [
        {
          id: `condition-${Date.now()}-1`,
          title: "New Condition",
          field: "vote_count",
          operator: "equals",
          value: "",
        },
      ],
    };

    const addToParent = (group: RuleGroup): RuleGroup => {
      if (group.id === parentGroupId) {
        return {
          ...group,
          conditions: [...group.conditions, newGroup],
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((item) =>
          "type" in item ? addToParent(item) : item,
        ),
      };
    };

    setRootGroup(addToParent(rootGroup));
  };

  const removeItem = (groupId: string, itemId: string) => {
    const removeFromGroup = (group: RuleGroup): RuleGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.filter(
            (item) => item.id !== itemId,
          ),
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((item) =>
          "type" in item ? removeFromGroup(item) : item,
        ),
      };
    };

    setRootGroup(removeFromGroup(rootGroup));
  };

  const updateCondition = (
    conditionId: string,
    updates: Partial<Condition>,
  ) => {
    const updateInGroup = (group: RuleGroup): RuleGroup => {
      return {
        ...group,
        conditions: group.conditions.map((item) => {
          if ("type" in item) {
            return updateInGroup(item);
          }
          if (item.id === conditionId) {
            return { ...item, ...updates };
          }
          return item;
        }),
      };
    };

    setRootGroup(updateInGroup(rootGroup));
  };

  const toggleOperator = (groupId: string) => {
    const updateOperator = (group: RuleGroup): RuleGroup => {
      if (group.id === groupId) {
        return {
          ...group,
          operator: group.operator === "AND" ? "OR" : "AND",
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((item) =>
          "type" in item ? updateOperator(item) : item,
        ),
      };
    };

    setRootGroup(updateOperator(rootGroup));
  };

  const moveItem = (
    groupId: string,
    dragIndex: number,
    hoverIndex: number,
  ) => {
    const reorderInGroup = (group: RuleGroup): RuleGroup => {
      if (group.id === groupId) {
        const newConditions = [...group.conditions];
        const [removed] = newConditions.splice(dragIndex, 1);
        newConditions.splice(hoverIndex, 0, removed);
        return {
          ...group,
          conditions: newConditions,
        };
      }
      return {
        ...group,
        conditions: group.conditions.map((item) =>
          "type" in item ? reorderInGroup(item) : item,
        ),
      };
    };

    setRootGroup(reorderInGroup(rootGroup));
  };

  const findParentGroup = (
    targetGroupId: string,
    currentGroup: RuleGroup = rootGroup,
  ): string | null => {
    for (const item of currentGroup.conditions) {
      if ("type" in item) {
        if (item.id === targetGroupId) {
          return currentGroup.id;
        }
        const found = findParentGroup(targetGroupId, item);
        if (found) return found;
      }
    }
    return null;
  };

  const renderCondition = (
    condition: Condition,
    groupId: string,
    index: number,
  ) => {
    const needsDropdown =
      condition.field === "investor_type" ||
      condition.field === "company" ||
      condition.field === "board_seat" ||
      condition.field === "voting_rights";

    const isExcludeCompany =
      condition.field === "exclude_company";

    return (
      <DraggableItem
        key={condition.id}
        id={condition.id}
        index={index}
        groupId={groupId}
        moveItem={moveItem}
      >
        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors space-y-2">
          {/* Title Field */}
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            <Input
              type="text"
              placeholder="Rule title..."
              value={condition.title}
              onChange={(e) =>
                updateCondition(condition.id, {
                  title: e.target.value,
                })
              }
              className="flex-1 font-medium text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(groupId, condition.id)}
              className="text-gray-400 hover:text-red-600 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Rule Configuration */}
          <div className="flex items-center gap-2 flex-wrap ml-6">
            <Select
              value={condition.field}
              onValueChange={(value) =>
                updateCondition(condition.id, { field: value })
              }
            >
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isExcludeCompany && (
              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  updateCondition(condition.id, {
                    operator: value,
                  })
                }
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATOR_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isExcludeCompany ? (
              <Input
                type="text"
                placeholder="Enter company name"
                value={condition.value}
                onChange={(e) =>
                  updateCondition(condition.id, {
                    value: e.target.value,
                  })
                }
                className="w-[160px] h-8 text-xs"
              />
            ) : needsDropdown ? (
              <Select
                value={condition.value}
                onValueChange={(value) =>
                  updateCondition(condition.id, { value })
                }
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {condition.field === "investor_type" &&
                    INVESTOR_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  {condition.field === "company" &&
                    COMPANIES.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  {(condition.field === "board_seat" ||
                    condition.field === "voting_rights") && (
                    <>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            ) : condition.field === "equity_share" ? (
              <div className="relative w-[160px]">
                <Input
                  type="number"
                  placeholder="Enter value"
                  value={condition.value}
                  onChange={(e) =>
                    updateCondition(condition.id, {
                      value: e.target.value,
                    })
                  }
                  className="pr-8 h-8 text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">
                  %
                </span>
              </div>
            ) : (
              <Input
                type={
                  condition.field.includes("count")
                    ? "number"
                    : "text"
                }
                placeholder="Enter value"
                value={condition.value}
                onChange={(e) =>
                  updateCondition(condition.id, {
                    value: e.target.value,
                  })
                }
                className="w-[160px] h-8 text-xs"
              />
            )}
          </div>
        </div>
      </DraggableItem>
    );
  };

  const renderGroup = (
    group: RuleGroup,
    isRoot = false,
    depth = 0,
  ): React.ReactElement => {
    const operatorLabel =
      group.operator === "AND" ? "All" : "Any";
    const operatorDescription =
      group.operator === "AND"
        ? "All of the following must be true"
        : "At least one of the following must be true";

    const parentGroupId = findParentGroup(group.id);

    return (
      <div key={group.id} className="space-y-2">
        {/* Group Content */}
        <div
          className={`
            ${!isRoot ? "border-l-4 pl-3" : ""} 
            ${group.operator === "AND" ? "border-blue-400" : "border-purple-400"}
          `}
        >
          {/* Group Header - inside the border */}
          <div className="flex items-center gap-2 mb-2">
            {!isRoot && (
              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
            )}

            <button
              onClick={() => toggleOperator(group.id)}
              title={operatorDescription}
              className={`
                px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer flex-shrink-0
                ${
                  group.operator === "AND"
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }
              `}
            >
              {operatorLabel}
            </button>

            {!isRoot && parentGroupId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeItem(parentGroupId, group.id)
                }
                className="text-gray-400 hover:text-red-600 h-6 w-6 p-0 flex-shrink-0 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            {group.conditions.map((item, index) => (
              <div key={item.id}>
                {index > 0 && (
                  <div className="flex items-center gap-2 my-1.5">
                    <div className="h-px bg-gray-300 flex-1" />
                    <span
                      className={`
                        text-xs font-semibold px-2 py-0.5 rounded
                        ${
                          group.operator === "AND"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        }
                      `}
                    >
                      {group.operator}
                    </span>
                    <div className="h-px bg-gray-300 flex-1" />
                  </div>
                )}
                {"type" in item
                  ? renderGroup(item, false, depth + 1)
                  : renderCondition(item, group.id, index)}
              </div>
            ))}

            {/* Add buttons at the bottom of each group */}
            {group.conditions.length > 0 && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(group.id)}
                  className="text-gray-600 h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Condition
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addGroup(group.id)}
                  className="text-gray-600 h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Group
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl mb-1">
            Voting Rules Configuration
          </h1>
          <p className="text-sm text-gray-600">
            Define who can vote based on their attributes. Rules
            are evaluated from top to bottom.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 mb-4">
          {/* Left Column - Ruleset Management */}
          <div className="space-y-3">
            {/* Ruleset Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Ruleset
              </label>
              <Select
                value={selectedRulesetId}
                onValueChange={handleRulesetChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ruleset" />
                </SelectTrigger>
                <SelectContent>
                  {rulesetGroups.map((ruleset) => (
                    <SelectItem key={ruleset.id} value={ruleset.id}>
                      {ruleset.name} — {ruleset.context}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plain Text Description */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Rule Summary
              </label>
              <pre className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap font-sans">
                {ruleDescription || "No rules defined yet"}
              </pre>
            </div>

            {/* Create New Ruleset */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Create New Ruleset
              </h3>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Ruleset name"
                  className="w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Context (e.g., Procurement)"
                  className="w-full text-sm"
                />
                <Button
                  size="sm"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={() => {
                    // TODO: Implement create new ruleset
                    alert("Create new ruleset functionality");
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Ruleset
                </Button>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-gray-600">
                    = All conditions must match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-gray-600">
                    = At least one must match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    Drag conditions to reorder • Click "All" or
                    "Any" to switch logic
                  </span>
                </div>
              </div>
            </div>
          </div>
          

          {/* Right Column - Rules Editor */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            {renderGroup(rootGroup, true)}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2">
          <Button size="sm">Cancel</Button>
          <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
            Save Rules
          </Button>
        </div>
      </div>
    </DndProvider>
  );
}