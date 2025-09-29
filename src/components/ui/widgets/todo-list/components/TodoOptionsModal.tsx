import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getWidgetText } from '@/config/brand';
import type { TodoListOptions } from '../types';

interface TodoOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: TodoListOptions;
  onSave: (options: TodoListOptions) => void;
}

export function TodoOptionsModal({ isOpen, onClose, options, onSave }: TodoOptionsModalProps) {
  const [localOptions, setLocalOptions] = React.useState<TodoListOptions>(options);

  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleSave = () => {
    onSave(localOptions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getWidgetText.todoList.options.title('ko')}</DialogTitle>
          <DialogDescription>
            {getWidgetText.todoList.options.description('ko')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* 날짜 표기 형식 설정 */}
          <div className="space-y-3">
            <Label>{getWidgetText.todoList.options.dateFormat.label('ko')}</Label>
            <RadioGroup
              value={localOptions.dateFormat}
              onValueChange={(value) => 
                setLocalOptions({ ...localOptions, dateFormat: value as 'dday' | 'date' })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dday" id="dday" />
                <Label htmlFor="dday" className="font-normal cursor-pointer">
                  {getWidgetText.todoList.options.dateFormat.dday('ko')}
                  <span className="text-muted-foreground text-sm ml-2">(D-3, 오늘, 내일)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date" className="font-normal cursor-pointer">
                  {getWidgetText.todoList.options.dateFormat.date('ko')}
                  <span className="text-muted-foreground text-sm ml-2">(12/25, 1/15)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 하위 태스크 표시 설정 */}
          <div className="space-y-3">
            <Label>{getWidgetText.todoList.options.subtaskDisplay.label('ko')}</Label>
            <RadioGroup
              value={localOptions.subtaskDisplay}
              onValueChange={(value) => 
                setLocalOptions({ ...localOptions, subtaskDisplay: value as 'expanded' | 'collapsed' })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expanded" id="expanded" />
                <Label htmlFor="expanded" className="font-normal cursor-pointer">
                  {getWidgetText.todoList.options.subtaskDisplay.expanded('ko')}
                  <span className="text-muted-foreground text-sm ml-2">(모든 하위 태스크 표시)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="collapsed" id="collapsed" />
                <Label htmlFor="collapsed" className="font-normal cursor-pointer">
                  {getWidgetText.todoList.options.subtaskDisplay.collapsed('ko')}
                  <span className="text-muted-foreground text-sm ml-2">(하위 태스크 숨김)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {getWidgetText.todoList.options.cancel('ko')}
          </Button>
          <Button onClick={handleSave}>
            {getWidgetText.todoList.options.save('ko')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}